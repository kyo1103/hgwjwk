/**
 * 4대사회보험 수집 워커
 * Playwright Chromium → 4대사회보험 정보연계센터(4insure.or.kr) 자동 수집
 *
 * 수집 문서 (7종): 가입내역확인서, 건강/국민연금/고용/산재 + 건강보험·국민연금 고지내역
 * 설정: bridge-agent/.env (FOURINSURE_USER_ID / FOURINSURE_USER_PW)
 */

import path from 'path';
import fs from 'fs-extra';
import { config } from '../config.mjs';
import { createProviderFiles } from './shared.mjs';

const BASE_URL = 'https://www.4insure.or.kr';

// ─── 유틸 ──────────────────────────────────────────────────────────────────

function sanitize(v) {
  return String(v || '').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').replace(/\s+/g, '_').slice(0, 80);
}

async function saveScreenshot(page, label, outputDir) {
  if (!config.screenshotOnError) return;
  try {
    const dir = path.join(outputDir, '..', 'screenshots');
    await fs.ensureDir(dir);
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ path: path.join(dir, `${ts}_${label}.png`), fullPage: true });
  } catch { /* 무시 */ }
}

async function tryClick(page, selectors, opts = {}) {
  for (const sel of [].concat(selectors)) {
    try { await page.click(sel, { timeout: 5000, ...opts }); return true; } catch { /* 계속 */ }
  }
  return false;
}

async function tryFill(page, selectors, value) {
  for (const sel of [].concat(selectors)) {
    try { await page.fill(sel, value, { timeout: 5000 }); return true; } catch { /* 계속 */ }
  }
  return false;
}

async function savePdf(page, download, outputPath) {
  if (download) { await download.saveAs(outputPath); return true; }
  await page.pdf({ path: outputPath, format: 'A4', printBackground: true });
  return true;
}

// ─── 로그인 ────────────────────────────────────────────────────────────────

async function login(page, appendLog, jobId) {
  appendLog(jobId, '4대보험 포털 로그인');
  await page.goto(`${BASE_URL}/co/login/loginMain.do`, {
    waitUntil: 'networkidle', timeout: config.pageTimeout,
  });
  await page.waitForTimeout(800);

  const idOk = await tryFill(page, ['#loginId', 'input[name="loginId"]', 'input[placeholder*="아이디"]', 'input[type="text"]'], config.fourinsure.userId);
  if (!idOk) throw new Error('4대보험 ID 입력란 없음');

  const pwOk = await tryFill(page, ['#loginPw', 'input[name="loginPw"]', 'input[type="password"]'], config.fourinsure.userPw);
  if (!pwOk) throw new Error('4대보험 비밀번호 입력란 없음');

  await tryClick(page, ['#loginBtn', 'button[class*="login"]', 'input[type="submit"]', 'a:has-text("로그인")']);
  await page.waitForLoadState('networkidle', { timeout: config.pageTimeout });
  appendLog(jobId, '4대보험 포털 로그인 완료');
}

// ─── 개별 문서 다운로드 ────────────────────────────────────────────────────

async function fetchDoc(page, { url, docLabel, bizNo, outputPath }, appendLog, jobId) {
  appendLog(jobId, `${docLabel} 조회 중`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: config.pageTimeout });
  await page.waitForTimeout(800);

  const bizNoClean = (bizNo || '').replace(/-/g, '');
  await tryFill(page, ['#bizNo', 'input[name="bizNo"]', 'input[placeholder*="사업자"]'], bizNoClean);
  await tryClick(page, ['button:has-text("조회")', '#searchBtn', 'input[value="조회"]']);
  await page.waitForTimeout(1800);

  const dlPromise = page.waitForDownload({ timeout: 20000 }).catch(() => null);
  await tryClick(page, ['button:has-text("PDF")', 'button:has-text("출력")', 'button:has-text("저장")', 'a:has-text("발급")']);
  return savePdf(page, await dlPromise, outputPath);
}

const DOC_DEFS = [
  {
    type: 'coverage_statement',
    label: '4대보험가입내역확인서',
    url: `${BASE_URL}/co/prs/issuance/issuanceMain.do`,
  },
  {
    type: 'health_insurance',
    label: '건강보험상세조회',
    url: `${BASE_URL}/co/prs/healthIns/healthInsMain.do`,
  },
  {
    type: 'national_pension',
    label: '국민연금상세조회',
    url: `${BASE_URL}/co/prs/natPen/natPenMain.do`,
  },
  {
    type: 'employment_insurance',
    label: '고용보험상세조회',
    url: `${BASE_URL}/co/prs/empIns/empInsMain.do`,
  },
  {
    type: 'industrial_accident',
    label: '산재보험가입확인서',
    url: `${BASE_URL}/co/prs/indAcc/indAccMain.do`,
  },
  // 고지내역 조회 (건강보험공단 / 국민연금공단 직접 연계)
  {
    type: 'health_insurance_notice',
    label: '건강보험고지내역',
    url: 'https://www.nhis.or.kr/nhis/business/retrieveContributionNotice.do',
  },
  {
    type: 'national_pension_notice',
    label: '국민연금고지내역',
    url: 'https://www.nps.or.kr/jsppage/business/contribute/contribute_01.jsp',
  },
];

// ─── 메인 워커 ─────────────────────────────────────────────────────────────

export async function runFourInsureJob({ jobId, company, outputDir, appendLog }) {
  appendLog(jobId, '4대보험 작업 시작');

  const isPlaceholder = (v) => !v || v.includes('여기에_') || v.includes('아이디') || v === 'YOUR_ID' || v.length < 3;
  if (!config.fourinsure.enabled || isPlaceholder(config.fourinsure.userId) || isPlaceholder(config.fourinsure.userPw)) {
    appendLog(jobId, '⚠ 4대보험 자격증명 미설정');
    appendLog(jobId, '  → bridge-agent/.env 파일에 FOURINSURE_USER_ID / FOURINSURE_USER_PW 를 실제 값으로 입력하세요');
    appendLog(jobId, '샘플 PDF 생성으로 대체합니다');
    return runFallback({ jobId, company, outputDir, appendLog });
  }

  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    appendLog(jobId, '⚠ Playwright 미설치 — `npm run install-browsers` 실행 필요');
    return runFallback({ jobId, company, outputDir, appendLog });
  }

  const providerDir = path.join(
    outputDir,
    sanitize(company.bizNo || company.name),
    'fourinsure',
    String(new Date().getFullYear()),
    String(new Date().getMonth() + 1).padStart(2, '0'),
  );
  await fs.ensureDir(providerDir);

  const browser = await chromium.launch({
    headless: config.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR'],
  });

  const files = [];

  try {
    const ctx = await browser.newContext({ acceptDownloads: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul' });
    const page = await ctx.newPage();
    page.setDefaultTimeout(config.pageTimeout);

    await login(page, appendLog, jobId);

    for (const doc of DOC_DEFS) {
      const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
      const fileName = `${sanitize(company.name)}_fourinsure_${doc.type}_${company.baseYm}_${stamp}.pdf`;
      const absolutePath = path.join(providerDir, fileName);
      const relativePath = path.relative(outputDir, absolutePath).replace(/\\/g, '/');

      try {
        await fetchDoc(page, { url: doc.url, docLabel: doc.label, bizNo: company.bizNo, outputPath: absolutePath }, appendLog, jobId);
        files.push({ provider: 'fourinsure', documentType: doc.type, fileName, absolutePath, relativePath, url: `/files/${relativePath}`, createdAt: new Date().toISOString() });
        appendLog(jobId, `✓ ${doc.label}: ${fileName}`);
      } catch (err) {
        appendLog(jobId, `⚠ ${doc.label} 실패: ${err.message} — 샘플로 대체`);
        await saveScreenshot(page, `fourinsure_${doc.type}_err`, outputDir);
        await writeSamplePdf(absolutePath, doc.label);
        files.push({ provider: 'fourinsure', documentType: doc.type, fileName, absolutePath, relativePath, url: `/files/${relativePath}`, createdAt: new Date().toISOString() });
      }
    }

    await browser.close();
  } catch (err) {
    await browser.close().catch(() => {});
    appendLog(jobId, `4대보험 자동화 오류: ${err.message}`);
    return runFallback({ jobId, company, outputDir, appendLog });
  }

  appendLog(jobId, `4대보험 작업 완료 — ${files.length}건`);
  return { files };
}

// ─── 내부 유틸 ─────────────────────────────────────────────────────────────

async function writeSamplePdf(outputPath, label) {
  const text = String(label).replace(/[()\\]/g, '');
  const content = `BT\n/F1 14 Tf\n72 720 Td\n(${text}) Tj\nET\n`;
  const objs = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}endstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ];
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  for (const o of objs) { offsets.push(Buffer.byteLength(pdf, 'utf8')); pdf += o; }
  const xref = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  await fs.writeFile(outputPath, pdf);
}

async function runFallback({ jobId, company, outputDir, appendLog }) {
  const files = await createProviderFiles({
    provider: 'fourinsure', company, outputDir, appendLog, jobId,
    docs: [
      { type: 'coverage_statement',        label: '4대보험가입내역확인서' },
      { type: 'health_insurance',          label: '건강보험상세조회' },
      { type: 'national_pension',          label: '국민연금상세조회' },
      { type: 'employment_insurance',      label: '고용보험상세조회' },
      { type: 'industrial_accident',       label: '산재보험가입확인서' },
      { type: 'health_insurance_notice',   label: '건강보험고지내역' },
      { type: 'national_pension_notice',   label: '국민연금고지내역' },
    ],
  });
  appendLog(jobId, `4대보험 샘플 완료 — ${files.length}건`);
  return { files };
}
