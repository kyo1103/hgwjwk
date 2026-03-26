"use client";

import { useState } from "react";
import type { CertIssueRecord } from "@/lib/server/portal-store";

interface Props {
  tenantSlug: string;
  initialHistory: CertIssueRecord[];
  canIssue: boolean;
}

const CERT_CATALOG = [
  { certType: "business_registration", certTitle: "사업자등록증명", source: "홈택스", mode: "즉시 발급" },
  { certType: "certificate_of_tax_payment", certTitle: "납세증명서", source: "홈택스", mode: "즉시 발급" },
  { certType: "vat_base_certificate", certTitle: "부가가치세 과세표준증명", source: "홈택스", mode: "기간 선택" },
  { certType: "financial_statement", certTitle: "표준재무제표증명", source: "홈택스", mode: "연도 선택" },
  { certType: "income_certificate", certTitle: "소득금액증명", source: "홈택스", mode: "연도 선택" },
  { certType: "local_tax_certificate", certTitle: "지방세 납세증명서", source: "위택스", mode: "즉시 발급" },
  { certType: "coverage_statement", certTitle: "4대보험 완납증명서", source: "4대보험", mode: "즉시 발급" },
  { certType: "health_insurance", certTitle: "4대보험 가입자 명부", source: "4대보험", mode: "즉시 발급" },
];

const SOURCE_COLOR: Record<string, string> = {
  홈택스: "#0369a1",
  위택스: "#7c3aed",
  "4대보험": "#059669",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "대기",
  processing: "발급 중",
  done: "완료",
  failed: "실패",
};
const STATUS_TONE: Record<string, string> = {
  pending: "warn",
  processing: "info",
  done: "ok",
  failed: "err",
};

export function CertIssuePanel({ tenantSlug, initialHistory, canIssue }: Props) {
  const [history, setHistory] = useState<CertIssueRecord[]>(initialHistory);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const issue = async (cert: (typeof CERT_CATALOG)[0]) => {
    if (!canIssue) return;
    setLoading(cert.certType);
    setError("");
    try {
      const res = await fetch(`/api/portal/${tenantSlug}/certificates/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cert),
      });
      if (!res.ok) throw new Error("발급 요청 실패");
      const data = await res.json() as { record: CertIssueRecord };
      setHistory((prev) => [data.record, ...prev]);

      // 3초 후 상태 polling (간단 구현)
      setTimeout(async () => {
        const r2 = await fetch(`/api/portal/${tenantSlug}/certificates/history`);
        if (r2.ok) {
          const d2 = await r2.json() as { history: CertIssueRecord[] };
          setHistory(d2.history);
        }
      }, 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {error && (
        <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--red-bg)", color: "var(--red)", fontSize: "0.82rem" }}>
          {error}
        </div>
      )}

      {/* 발급 버튼 그리드 */}
      <div className="grid grid-2">
        {CERT_CATALOG.map((cert) => {
          const isLoading = loading === cert.certType;
          return (
            <div
              key={cert.certType}
              className="card"
              style={{ padding: "18px 20px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 8 }}>
                <strong style={{ fontSize: "0.92rem", color: "var(--text-1)" }}>{cert.certTitle}</strong>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 99,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    background: `${SOURCE_COLOR[cert.source]}18`,
                    color: SOURCE_COLOR[cert.source] ?? "var(--text-3)",
                    flexShrink: 0,
                  }}
                >
                  {cert.source}
                </span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--text-4)", marginBottom: 14 }}>{cert.mode}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn"
                  style={{ fontSize: "0.82rem", padding: "7px 16px", flex: 1, opacity: (!canIssue || isLoading) ? 0.6 : 1 }}
                  disabled={!canIssue || isLoading || !!loading}
                  onClick={() => issue(cert)}
                >
                  {isLoading ? "발급 요청 중..." : "발급"}
                </button>
              </div>
              {!canIssue && (
                <p style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--amber)" }}>
                  이 역할은 발급 권한이 제한됩니다.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* 발급 이력 */}
      {history.length > 0 && (
        <div>
          <h3 style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 12, color: "var(--text-1)" }}>발급 이력</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>서류명</th>
                  <th>출처</th>
                  <th>요청자</th>
                  <th>상태</th>
                  <th>요청일시</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {history.map((rec) => (
                  <tr key={rec.id}>
                    <td>{rec.certTitle}</td>
                    <td>{rec.source}</td>
                    <td>{rec.requestedBy}</td>
                    <td><span className={`badge ${STATUS_TONE[rec.status]}`}>{STATUS_LABEL[rec.status]}</span></td>
                    <td>{new Date(rec.requestedAt).toLocaleString("ko-KR")}</td>
                    <td>
                      {rec.status === "done" && rec.filePath && (
                        <a href={rec.filePath} download className="btn outline" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>
                          다운로드
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
