"use client";

import { useState, useEffect, useCallback } from "react";

interface TaxinvoiceItem {
  ntsconfirmNum?: string;
  issueDate?: string;
  supplyCostTotal?: string | number;
  taxTotal?: string | number;
  invoicerCorpName?: string;
  invoiceeCorpName?: string;
  purposeType?: string;
  [key: string]: unknown;
}

interface CashreceiptItem {
  tradeDate?: string;
  totalAmount?: string | number;
  supplyCost?: string | number;
  tax?: string | number;
  franchiseCorpName?: string;
  [key: string]: unknown;
}

interface CollectResult {
  taxinvoices: TaxinvoiceItem[];
  cashreceipts: CashreceiptItem[];
  summary: unknown;
  meta: { corpNum: string; baseYm: string; collectedAt: string };
}

interface JobState {
  status: "running" | "done" | "failed";
  logs: string[];
  result?: CollectResult;
  error?: string;
}

interface Props {
  tenantSlug: string;
  /** 고객사 사업자번호 (하이픈 없이 10자리, 없으면 입력 필드로 받음) */
  corpNum?: string;
}

function fmt(v: string | number | undefined) {
  if (v === undefined || v === null) return "-";
  const n = Number(v);
  if (isNaN(n)) return String(v);
  return n.toLocaleString("ko-KR") + "원";
}

export function PopbillDataPanel({ tenantSlug, corpNum: propCorpNum }: Props) {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
  const [corpNum, setCorpNum] = useState(propCorpNum || "");
  const [baseYm, setBaseYm] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<JobState | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"taxinvoice" | "cashreceipt" | "log">("taxinvoice");

  // 팝빌 활성화 상태 확인
  useEffect(() => {
    fetch(`/api/portal/${tenantSlug}/popbill/status`)
      .then((r) => r.json())
      .then((d) => setIsEnabled(d.enabled))
      .catch(() => setIsEnabled(false));
  }, [tenantSlug]);

  // 작업 폴링
  const pollJob = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/portal/${tenantSlug}/popbill/collect/${id}`);
      const data = await res.json();
      if (data.ok && data.job) {
        setJob(data.job);
        if (data.job.status === "running") {
          setTimeout(() => pollJob(id), 2000);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    },
    [tenantSlug]
  );

  async function startCollect() {
    const clean = corpNum.replace(/-/g, "");
    if (clean.length !== 10) {
      alert("사업자번호 10자리를 입력하세요.");
      return;
    }
    setLoading(true);
    setJob(null);
    setJobId(null);

    const res = await fetch(`/api/portal/${tenantSlug}/popbill/collect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ corpNum: clean, baseYm }),
    });
    const data = await res.json();
    if (data.ok && data.jobId) {
      setJobId(data.jobId);
      pollJob(data.jobId);
    } else {
      alert(data.message || "수집 요청 실패");
      setLoading(false);
    }
  }

  // ── 비활성화 상태 ────────────────────────────────────────────
  if (isEnabled === false) {
    return (
      <section className="panel">
        <div className="panel-header">
          <h2>팝빌 홈택스 연동</h2>
          <span className="badge warn">비활성화</span>
        </div>
        <div className="panel-body">
          <div className="card" style={{ padding: 20, borderLeft: "4px solid var(--amber)" }}>
            <strong style={{ display: "block", marginBottom: 8 }}>팝빌 연동이 비활성화 상태입니다</strong>
            <p style={{ fontSize: "0.85rem", color: "var(--text-3)" }}>
              <code>bridge-agent/.env</code>에서 아래 설정을 입력하면 홈택스 세금계산서·현금영수증을 자동 수집합니다.
            </p>
            <pre style={{ marginTop: 12, padding: "10px 14px", background: "var(--surface-2)", borderRadius: 6, fontSize: "0.78rem", overflowX: "auto" }}>
{`POPBILL_ENABLED=true
POPBILL_LINK_ID=팝빌링크ID
POPBILL_SECRET_KEY=팝빌시크릿키
POPBILL_IS_TEST=true
POPBILL_AGENT_CORP_NUM=세무사사업자번호10자리`}
            </pre>
          </div>
        </div>
      </section>
    );
  }

  if (isEnabled === null) {
    return (
      <section className="panel">
        <div className="panel-header"><h2>팝빌 홈택스 연동</h2></div>
        <div className="panel-body" style={{ padding: 24, color: "var(--text-4)", textAlign: "center" }}>
          연동 상태 확인 중...
        </div>
      </section>
    );
  }

  const result = job?.result;

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>팝빌 홈택스 연동</h2>
        <span className="badge ok">활성화</span>
      </div>
      <div className="panel-body">
        {/* 수집 파라미터 입력 */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 16 }}>
          {!propCorpNum && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>사업자번호 (10자리)</label>
              <input
                className="input"
                value={corpNum}
                onChange={(e) => setCorpNum(e.target.value.replace(/[^0-9-]/g, ""))}
                placeholder="0000000000"
                style={{ width: 160 }}
                maxLength={12}
              />
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>기준 연월</label>
            <input
              className="input"
              value={baseYm}
              onChange={(e) => setBaseYm(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              placeholder="YYYYMM"
              style={{ width: 110 }}
              maxLength={6}
            />
          </div>
          <button
            className="btn"
            onClick={startCollect}
            disabled={loading}
            style={{ height: 38 }}
          >
            {loading ? "수집 중..." : "홈택스 수집"}
          </button>
          {job?.status === "done" && (
            <span style={{ fontSize: "0.82rem", color: "var(--green)", alignSelf: "center" }}>
              ✓ 수집 완료 ({result?.meta.collectedAt?.slice(11, 19)})
            </span>
          )}
          {job?.status === "failed" && (
            <span style={{ fontSize: "0.82rem", color: "var(--red)", alignSelf: "center" }}>
              ✗ 수집 실패: {job.error}
            </span>
          )}
        </div>

        {/* 탭 */}
        {job && (
          <>
            <div style={{ display: "flex", gap: 6, marginBottom: 14, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
              {(["taxinvoice", "cashreceipt", "log"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "6px 14px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    borderBottom: activeTab === tab ? "2px solid var(--brand)" : "2px solid transparent",
                    color: activeTab === tab ? "var(--text-1)" : "var(--text-3)",
                    marginBottom: -1,
                  }}
                >
                  {tab === "taxinvoice"
                    ? `세금계산서 ${result ? `(${result.taxinvoices.length})` : ""}`
                    : tab === "cashreceipt"
                    ? `현금영수증 ${result ? `(${result.cashreceipts.length})` : ""}`
                    : "수집 로그"}
                </button>
              ))}
            </div>

            {/* 세금계산서 탭 */}
            {activeTab === "taxinvoice" && (
              <>
                {loading || !result ? (
                  <TaxinvoiceSkeleton />
                ) : result.taxinvoices.length === 0 ? (
                  <EmptyState text="해당 월 전자세금계산서(매입)가 없습니다." />
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                      <thead>
                        <tr style={{ background: "var(--surface-2)", textAlign: "left" }}>
                          <th style={thStyle}>발급일</th>
                          <th style={thStyle}>공급자</th>
                          <th style={thStyle}>공급가액</th>
                          <th style={thStyle}>세액</th>
                          <th style={thStyle}>국세청승인번호</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.taxinvoices.map((item, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={tdStyle}>{item.issueDate || "-"}</td>
                            <td style={tdStyle}>{item.invoicerCorpName || "-"}</td>
                            <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(item.supplyCostTotal)}</td>
                            <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(item.taxTotal)}</td>
                            <td style={{ ...tdStyle, fontSize: "0.72rem", color: "var(--text-4)" }}>
                              {item.ntsconfirmNum || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: "var(--surface-2)", fontWeight: 700 }}>
                          <td style={tdStyle} colSpan={2}>합계</td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>
                            {fmt(result.taxinvoices.reduce((s, x) => s + Number(x.supplyCostTotal || 0), 0))}
                          </td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>
                            {fmt(result.taxinvoices.reduce((s, x) => s + Number(x.taxTotal || 0), 0))}
                          </td>
                          <td style={tdStyle} />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* 현금영수증 탭 */}
            {activeTab === "cashreceipt" && (
              <>
                {loading || !result ? (
                  <TaxinvoiceSkeleton />
                ) : result.cashreceipts.length === 0 ? (
                  <EmptyState text="해당 월 현금영수증(매입)이 없습니다." />
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                      <thead>
                        <tr style={{ background: "var(--surface-2)", textAlign: "left" }}>
                          <th style={thStyle}>거래일</th>
                          <th style={thStyle}>가맹점</th>
                          <th style={thStyle}>공급가액</th>
                          <th style={thStyle}>세액</th>
                          <th style={thStyle}>합계금액</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.cashreceipts.map((item, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={tdStyle}>{item.tradeDate || "-"}</td>
                            <td style={tdStyle}>{item.franchiseCorpName || "-"}</td>
                            <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(item.supplyCost)}</td>
                            <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(item.tax)}</td>
                            <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(item.totalAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: "var(--surface-2)", fontWeight: 700 }}>
                          <td style={tdStyle} colSpan={2}>합계</td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>
                            {fmt(result.cashreceipts.reduce((s, x) => s + Number(x.supplyCost || 0), 0))}
                          </td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>
                            {fmt(result.cashreceipts.reduce((s, x) => s + Number(x.tax || 0), 0))}
                          </td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>
                            {fmt(result.cashreceipts.reduce((s, x) => s + Number(x.totalAmount || 0), 0))}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* 수집 로그 탭 */}
            {activeTab === "log" && (
              <div style={{
                background: "var(--surface-2)",
                borderRadius: 6,
                padding: "12px 16px",
                fontFamily: "monospace",
                fontSize: "0.78rem",
                color: "var(--text-2)",
                maxHeight: 280,
                overflowY: "auto",
                lineHeight: 1.7,
              }}>
                {job.logs.map((log, i) => (
                  <div key={i} style={{ color: log.includes("오류") ? "var(--red)" : log.includes("완료") ? "var(--green)" : "inherit" }}>
                    {log}
                  </div>
                ))}
                {loading && (
                  <div style={{ color: "var(--brand)", marginTop: 4 }}>⏳ 수집 진행 중...</div>
                )}
              </div>
            )}
          </>
        )}

        {/* 안내 (초기 상태) */}
        {!job && !loading && (
          <div style={{ padding: "20px 0", color: "var(--text-4)", fontSize: "0.85rem", textAlign: "center" }}>
            사업자번호와 기준 연월을 입력 후 <strong>홈택스 수집</strong> 버튼을 누르면<br />
            전자세금계산서·현금영수증이 자동으로 불러와집니다.
          </div>
        )}
      </div>
    </section>
  );
}

const thStyle: React.CSSProperties = {
  padding: "8px 12px",
  fontWeight: 600,
  fontSize: "0.78rem",
  color: "var(--text-3)",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 12px",
  whiteSpace: "nowrap",
};

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-4)", fontSize: "0.85rem" }}>
      {text}
    </div>
  );
}

function TaxinvoiceSkeleton() {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ height: 36, background: "var(--surface-2)", borderRadius: 4, opacity: 0.6 }} />
      ))}
    </div>
  );
}
