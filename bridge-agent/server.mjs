import express from "express";
import cors from "cors";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { runHometaxJob } from "./worker/hometax.mjs";
import { runFourInsureJob } from "./worker/fourinsure.mjs";
import { config } from "./config.mjs";
import { collectHometaxData } from "./worker/popbill-hometax.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.BRIDGE_PORT || 43115);
const OUTPUT_DIR = path.resolve(__dirname, process.env.OUTPUT_DIR || "./downloads");

await fs.ensureDir(OUTPUT_DIR);

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/files", express.static(OUTPUT_DIR));

const jobs = new Map();

function setJob(jobId, patch) {
  const prev = jobs.get(jobId) || {};
  jobs.set(jobId, {
    ...prev,
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

function appendLog(jobId, message) {
  const prev = jobs.get(jobId);
  if (!prev) return;

  const logs = [...(prev.logs || []), `[${new Date().toLocaleTimeString("ko-KR")}] ${message}`];
  setJob(jobId, { logs });
}

function normalizeProvider(provider, scope) {
  if (provider) return provider;
  if (!Array.isArray(scope) || scope.length === 0) return null;

  const normalized = [...new Set(scope)].sort();
  if (normalized.length === 1 && normalized[0] === "hometax") return "hometax";
  if (normalized.length === 1 && normalized[0] === "fourinsure") return "fourinsure";
  if (
    normalized.length === 2 &&
    normalized.includes("fourinsure") &&
    normalized.includes("hometax")
  ) {
    return "bundle";
  }

  return null;
}

function normalizeCompany(company = {}) {
  return {
    name: company.name,
    bizNo: company.bizNo || company.businessNumber || "unknown-biz",
    manager: company.manager || "",
    baseYm: company.baseYm || new Date().toISOString().slice(0, 7),
  };
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    port: PORT,
    outputDir: OUTPUT_DIR,
    runningJobs: [...jobs.values()].filter((job) => job.status === "running").length,
    time: new Date().toISOString(),
  });
});

app.get("/jobs", (_req, res) => {
  res.json({ ok: true, jobs: [...jobs.values()] });
});

app.post("/jobs", async (req, res) => {
  const requestedProvider = String(req.body?.provider || "").trim().toLowerCase();
  const scope = Array.isArray(req.body?.scope)
    ? req.body.scope.map((item) => String(item).trim().toLowerCase())
    : undefined;
  const provider = normalizeProvider(requestedProvider, scope);
  const company = normalizeCompany(req.body?.company);

  if (!provider || !company.name) {
    return res.status(400).json({
      ok: false,
      message: "provider(또는 scope)와 company.name은 필수입니다.",
    });
  }

  const jobId = uuidv4();
  setJob(jobId, {
    id: jobId,
    status: "queued",
    provider,
    company,
    files: [],
    logs: [`작업 생성: ${provider} / ${company.name}`],
    createdAt: new Date().toISOString(),
  });

  res.json({ ok: true, jobId });

  void (async () => {
    try {
      setJob(jobId, { status: "running" });
      appendLog(jobId, "작업 큐 진입");

      let result;
      if (provider === "hometax") {
        result = await runHometaxJob({ jobId, company, outputDir: OUTPUT_DIR, appendLog });
      } else if (provider === "fourinsure") {
        result = await runFourInsureJob({ jobId, company, outputDir: OUTPUT_DIR, appendLog });
      } else if (provider === "bundle") {
        const hometax = await runHometaxJob({ jobId, company, outputDir: OUTPUT_DIR, appendLog });
        const fourInsure = await runFourInsureJob({
          jobId,
          company,
          outputDir: OUTPUT_DIR,
          appendLog,
        });
        result = {
          files: [...(hometax.files || []), ...(fourInsure.files || [])],
        };
      } else {
        throw new Error(`지원하지 않는 provider: ${provider}`);
      }

      setJob(jobId, {
        status: "done",
        files: result.files || [],
        finishedAt: new Date().toISOString(),
      });
      appendLog(jobId, `작업 완료: 파일 ${result.files?.length || 0}개`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      appendLog(jobId, `오류: ${message}`);
      setJob(jobId, {
        status: "failed",
        error: message,
        finishedAt: new Date().toISOString(),
      });
    }
  })();
});

app.get("/jobs/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ ok: false, message: "작업 없음" });
  }

  res.json({ ok: true, job });
});

// ═══════════════════════════════════════════════════════
//  팝빌 홈택스 스크래핑 엔드포인트
// ═══════════════════════════════════════════════════════

// 팝빌 수집 작업 저장소 (jobId → result)
const popbillJobs = new Map();

/**
 * POST /popbill/collect
 * body: { corpNum, baseYm }
 * 홈택스 세금계산서+현금영수증 수집 시작
 */
app.post("/popbill/collect", async (req, res) => {
  if (!config.popbill.enabled) {
    return res.status(503).json({ ok: false, message: "팝빌 연동이 비활성화 상태입니다 (POPBILL_ENABLED=false)" });
  }

  const corpNum = String(req.body?.corpNum || "").replace(/-/g, "").trim();
  const baseYm = String(req.body?.baseYm || new Date().toISOString().slice(0, 7).replace("-", "")).trim();

  if (!corpNum || corpNum.length !== 10) {
    return res.status(400).json({ ok: false, message: "corpNum은 하이픈 없이 10자리 사업자번호입니다." });
  }

  const jobId = uuidv4();
  popbillJobs.set(jobId, {
    id: jobId,
    status: "running",
    corpNum,
    baseYm,
    logs: [`수집 시작: ${corpNum} / ${baseYm}`],
    createdAt: new Date().toISOString(),
  });

  res.json({ ok: true, jobId });

  void (async () => {
    const appendPbLog = (msg) => {
      const prev = popbillJobs.get(jobId);
      if (!prev) return;
      popbillJobs.set(jobId, {
        ...prev,
        logs: [...(prev.logs || []), `[${new Date().toLocaleTimeString("ko-KR")}] ${msg}`],
        updatedAt: new Date().toISOString(),
      });
    };

    try {
      const result = await collectHometaxData({ corpNum, baseYm, appendLog: appendPbLog });
      popbillJobs.set(jobId, {
        ...popbillJobs.get(jobId),
        status: "done",
        result,
        finishedAt: new Date().toISOString(),
      });
      appendPbLog(`수집 완료 — 세금계산서 ${result.taxinvoices.length}건, 현금영수증 ${result.cashreceipts.length}건`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const prev = popbillJobs.get(jobId);
      popbillJobs.set(jobId, {
        ...prev,
        status: "failed",
        error: message,
        finishedAt: new Date().toISOString(),
      });
      appendPbLog(`오류: ${message}`);
    }
  })();
});

/**
 * GET /popbill/collect/:jobId
 * 수집 작업 상태 + 결과 조회
 */
app.get("/popbill/collect/:jobId", (req, res) => {
  const job = popbillJobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ ok: false, message: "작업 없음" });
  res.json({ ok: true, job });
});

/**
 * GET /popbill/status
 * 팝빌 연동 활성화 여부 + 설정 확인
 */
app.get("/popbill/status", (_req, res) => {
  res.json({
    ok: true,
    enabled: config.popbill.enabled,
    isTest: config.popbill.isTest,
    hasLinkId: Boolean(config.popbill.linkId),
    hasSecretKey: Boolean(config.popbill.secretKey),
    hasAgentCorpNum: Boolean(config.popbill.agentCorpNum),
  });
});

app.listen(PORT, () => {
  console.log(`Bridge agent listening on http://127.0.0.1:${PORT}`);
});
