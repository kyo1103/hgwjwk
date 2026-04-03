"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

/* ─────────────────────────── 타입 정의 ─────────────────────────── */

type StepStatus = "done" | "in-progress" | "pending";

interface ReportStep {
  label: string;
  status: StepStatus;
  hasButton: boolean;
  buttonLabel?: string;
}

interface TaxReport {
  taxType: string;
  steps: ReportStep[];
}

interface MonthData {
  month: number;
  reports: TaxReport[];
}

type IndustryCategory = "제조업" | "병의원" | "수출업";

interface Company {
  id: string;
  name: string;
  shortName: string;
  bizNo: string;
  manager: string;
  category: IndustryCategory;
  months: MonthData[];
}

const INDUSTRY_META: Record<IndustryCategory, { icon: string; color: string }> = {
  "제조업": { icon: "🏭", color: "#3b82f6" },
  "병의원": { icon: "🏥", color: "#ef4444" },
  "수출업": { icon: "🚢", color: "#8b5cf6" },
};

/* ─────────────────────────── 7단계 템플릿 ─────────────────────────── */

function makeSteps(doneCount: number, inProgressIndex?: number): ReportStep[] {
  const template: { label: string; hasButton: boolean; buttonLabel?: string }[] = [
    { label: "API 자동수집", hasButton: true, buttonLabel: "수집" },
    { label: "수기자료 요청", hasButton: true, buttonLabel: "발송" },
    { label: "자료 수집 완료", hasButton: false },
    { label: "세무사랑 서식 변환", hasButton: true, buttonLabel: "변환" },
    { label: "세무사랑 장부작업", hasButton: false },
    { label: "홈택스 신고 완료", hasButton: false },
    { label: "납부서·보고서 전송", hasButton: true, buttonLabel: "전송" },
  ];
  return template.map((t, idx) => {
    let status: StepStatus = "pending";
    if (idx < doneCount) status = "done";
    else if (idx === (inProgressIndex ?? doneCount)) status = "in-progress";
    return { ...t, status };
  });
}

/* ─────────────────────────── 목업 데이터 (5업체 × 3개월) ─────────────────────────── */

const MONTHS = [1, 2, 3];

const MOCK_COMPANIES: Company[] = [
  {
    id: "c1", name: "유니온테크 주식회사", shortName: "유니온테크", bizNo: "123-45-12345", manager: "김노무", category: "제조업",
    months: [
      { month: 1, reports: [{ taxType: "원천세", steps: makeSteps(5, 5) }, { taxType: "부가세", steps: makeSteps(3, 3) }] },
      { month: 2, reports: [{ taxType: "원천세", steps: makeSteps(2, 2) }] },
      { month: 3, reports: [{ taxType: "원천세", steps: makeSteps(0, 0) }, { taxType: "법인세", steps: makeSteps(1, 1) }] },
    ],
  },
  {
    id: "c2", name: "주식회사 데이터솔루션", shortName: "데이터솔루션", bizNo: "234-56-78901", manager: "이세무", category: "수출업",
    months: [
      { month: 1, reports: [{ taxType: "원천세", steps: makeSteps(7) }] },
      { month: 2, reports: [{ taxType: "원천세", steps: makeSteps(4, 4) }, { taxType: "부가세", steps: makeSteps(1, 1) }] },
      { month: 3, reports: [{ taxType: "원천세", steps: makeSteps(0, 0) }] },
    ],
  },
  {
    id: "c3", name: "코스모스 카페", shortName: "코스모스카페", bizNo: "345-67-89012", manager: "박대리", category: "병의원",
    months: [
      { month: 1, reports: [{ taxType: "원천세", steps: makeSteps(6, 6) }] },
      { month: 2, reports: [{ taxType: "원천세", steps: makeSteps(3, 3) }] },
      { month: 3, reports: [{ taxType: "원천세", steps: makeSteps(1, 1) }, { taxType: "종합소득세", steps: makeSteps(0, 0) }] },
    ],
  },
  {
    id: "c4", name: "에이스 건설", shortName: "에이스건설", bizNo: "456-78-90123", manager: "최주임", category: "제조업",
    months: [
      { month: 1, reports: [{ taxType: "원천세", steps: makeSteps(7) }, { taxType: "부가세", steps: makeSteps(7) }] },
      { month: 2, reports: [{ taxType: "원천세", steps: makeSteps(5, 5) }] },
      { month: 3, reports: [{ taxType: "원천세", steps: makeSteps(3, 3) }] },
    ],
  },
  {
    id: "c5", name: "스타트업 홀딩스", shortName: "스타트업홀딩스", bizNo: "567-89-01234", manager: "정과장", category: "수출업",
    months: [
      { month: 1, reports: [{ taxType: "원천세", steps: makeSteps(4, 4) }] },
      { month: 2, reports: [{ taxType: "원천세", steps: makeSteps(1, 1) }, { taxType: "부가세", steps: makeSteps(0, 0) }] },
      { month: 3, reports: [{ taxType: "원천세", steps: makeSteps(0, 0) }, { taxType: "법인세", steps: makeSteps(2, 2) }] },
    ],
  },
];

/* ─────────────────────────── 색상 상수 ─────────────────────────── */

const COLORS = {
  done: "#3b82f6",
  doneText: "#fff",
  inProgress: "#22c55e",
  inProgressText: "#fff",
  pending: "#f1f5f9",
  pendingText: "#94a3b8",
  border: "#e2e8f0",
  headerBg: "#f8fafc",
};

const TAX_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "원천세": { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
  "부가세": { bg: "#fef3c7", text: "#d97706", border: "#fde68a" },
  "법인세": { bg: "#ede9fe", text: "#7c3aed", border: "#c4b5fd" },
  "종합소득세": { bg: "#fce7f3", text: "#db2777", border: "#f9a8d4" },
  "연말정산": { bg: "#d1fae5", text: "#059669", border: "#6ee7b7" },
};

/* ─────────────────────────── 서브 컴포넌트 ─────────────────────────── */

function StepRow({ step, onToggle, onBtn }: { step: ReportStep; onToggle: () => void; onBtn: () => void }) {
  const bg = step.status === "done" ? COLORS.done : step.status === "in-progress" ? COLORS.inProgress : COLORS.pending;
  const tx = step.status === "done" ? COLORS.doneText : step.status === "in-progress" ? COLORS.inProgressText : COLORS.pendingText;
  const icon = step.status === "done" ? "✓" : step.status === "in-progress" ? "▶" : "○";

  return (
    <div onClick={onToggle} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "4px 7px", background: bg, borderRadius: 5, cursor: "pointer",
      transition: "all 0.2s", gap: 4, minHeight: 26,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: "0.65rem", color: tx, flexShrink: 0 }}>{icon}</span>
        <span style={{
          fontSize: "0.63rem", fontWeight: 600, color: tx,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{step.label}</span>
      </div>
      {step.hasButton && (
        <button onClick={e => { e.stopPropagation(); onBtn(); }} style={{
          padding: "1px 6px", fontSize: "0.58rem", fontWeight: 700, border: "none", borderRadius: 3,
          cursor: "pointer", flexShrink: 0,
          background: step.status === "pending" ? "#e2e8f0" : "rgba(255,255,255,0.3)",
          color: step.status === "pending" ? "#64748b" : "#fff",
          transition: "all 0.15s",
        }}>{step.buttonLabel}</button>
      )}
    </div>
  );
}

function TaxCard({ report, onStepToggle, onBtn }: {
  report: TaxReport;
  onStepToggle: (i: number) => void;
  onBtn: (i: number) => void;
}) {
  const tc = TAX_COLORS[report.taxType] || TAX_COLORS["원천세"];
  const done = report.steps.filter(s => s.status === "done").length;

  return (
    <div style={{
      border: `1.5px solid ${tc.border}`, borderRadius: 8, background: "#fff",
      overflow: "hidden", width: 180, flexShrink: 0,
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        background: tc.bg, padding: "5px 8px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: `1px solid ${tc.border}`,
      }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: tc.text }}>{report.taxType}</span>
        <span style={{
          fontSize: "0.6rem", fontWeight: 700, color: tc.text,
          background: "rgba(255,255,255,0.6)", padding: "1px 5px", borderRadius: 99,
        }}>{done}/7</span>
      </div>
      <div style={{ padding: 4, display: "flex", flexDirection: "column", gap: 2 }}>
        {report.steps.map((s, i) => (
          <StepRow key={i} step={s} onToggle={() => onStepToggle(i)} onBtn={() => onBtn(i)} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── 스타일 상수 ─────────────────────────── */

const STICKY_COL_W = 200;
const MONTH_COL_W = 420;

/* ─────────────────────────── 메인 페이지 ─────────────────────────── */

export default function ControlTowerPage() {
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [activeRow, setActiveRow] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const handleStepToggle = (cId: string, mIdx: number, rIdx: number, sIdx: number) => {
    setCompanies(prev => prev.map(c => {
      if (c.id !== cId) return c;
      const newMonths = c.months.map((m, mi) => {
        if (mi !== mIdx) return m;
        const newReports = m.reports.map((r, ri) => {
          if (ri !== rIdx) return r;
          const newSteps = r.steps.map((s, si) => {
            if (si !== sIdx) return s;
            const next: StepStatus = s.status === "pending" ? "in-progress" : s.status === "in-progress" ? "done" : "pending";
            return { ...s, status: next };
          });
          return { ...r, steps: newSteps };
        });
        return { ...m, reports: newReports };
      });
      return { ...c, months: newMonths };
    }));
  };

  const handleBtn = (name: string, tax: string, label: string) => {
    showToast(`${name} · ${tax} → "${label}" 실행됨`);
  };

  const scrollToRow = (id: string) => {
    setActiveRow(id);
    rowRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1800, margin: "0 auto" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          background: "#0f172a", color: "#fff", padding: "12px 20px",
          borderRadius: 10, fontSize: "0.85rem", fontWeight: 600,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          animation: "fadeInDown 0.3s ease",
        }}>{toast}</div>
      )}

      {/* Breadcrumb */}
      <div style={{ marginBottom: 16, display: "flex", gap: 6, alignItems: "center", fontSize: "0.82rem", color: "#94a3b8" }}>
        <Link href="/erp" style={{ color: "#94a3b8", textDecoration: "none" }}>대시보드</Link>
        <span>/</span>
        <span style={{ color: "#0f172a", fontWeight: 600 }}>신고 관제탑</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 4 }}>
          신고 관제탑
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.88rem" }}>
          업체별 · 월별 신고 진행 현황을 스프레드시트 형태로 관리합니다.
        </p>
      </div>

      {/* 범례 */}
      <div style={{ display: "flex", gap: 14, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        {[
          { label: "완료", color: COLORS.done },
          { label: "진행중", color: COLORS.inProgress },
          { label: "미완료", color: COLORS.pending, border: true },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 11, height: 11, borderRadius: 3, background: l.color, border: l.border ? "1px solid #cbd5e1" : "none" }} />
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>{l.label}</span>
          </div>
        ))}
        <div style={{ width: 1, height: 14, background: "#e2e8f0" }} />
        {Object.entries(TAX_COLORS).map(([t, c]) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 9, height: 9, borderRadius: 2, background: c.bg, border: `1px solid ${c.border}` }} />
            <span style={{ fontSize: "0.7rem", color: c.text, fontWeight: 700 }}>{t}</span>
          </div>
        ))}
      </div>

      {/* ─── 스프레드시트 ─── */}
      <div style={{
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        background: "#fff",
      }}>
        <div style={{
          overflow: "auto",
          maxHeight: "calc(100vh - 290px)",
          minHeight: 450,
        }}>
          <table style={{
            borderCollapse: "separate",
            borderSpacing: 0,
            width: STICKY_COL_W + MONTHS.length * MONTH_COL_W,
            tableLayout: "fixed",
          }}>
            {/* 칼럼 정의 */}
            <colgroup>
              <col style={{ width: STICKY_COL_W }} />
              {MONTHS.map(m => <col key={m} style={{ width: MONTH_COL_W }} />)}
            </colgroup>

            {/* ─── 헤더 ─── */}
            <thead>
              <tr>
                {/* 업체명 헤더 (sticky) */}
                <th style={{
                  position: "sticky", left: 0, top: 0, zIndex: 30,
                  background: "#f1f5f9", padding: "14px 16px",
                  textAlign: "left", fontSize: "0.78rem", fontWeight: 800,
                  color: "#475569", letterSpacing: "0.02em",
                  borderBottom: `2px solid ${COLORS.border}`,
                  borderRight: `2px solid ${COLORS.border}`,
                }}>
                  업체명
                  <span style={{
                    marginLeft: 8, background: "#e2e8f0", padding: "2px 7px",
                    borderRadius: 99, fontSize: "0.68rem", fontWeight: 700, color: "#64748b",
                  }}>{companies.length}</span>
                </th>

                {/* 월 헤더 */}
                {MONTHS.map(m => (
                  <th key={m} style={{
                    position: "sticky", top: 0, zIndex: 20,
                    background: "#f1f5f9", padding: "14px 20px",
                    textAlign: "center", fontSize: "0.9rem", fontWeight: 800,
                    color: "#334155", letterSpacing: "0.02em",
                    borderBottom: `2px solid ${COLORS.border}`,
                    borderRight: `1px solid ${COLORS.border}`,
                  }}>
                    {m}월
                  </th>
                ))}
              </tr>
            </thead>

            {/* ─── 바디: 업체별 행 ─── */}
            <tbody>
              {companies.map((company, cIdx) => {
                const isActive = activeRow === company.id;
                const meta = INDUSTRY_META[company.category];
                const totalSteps = company.months.reduce((s, m) => s + m.reports.reduce((s2, r) => s2 + r.steps.length, 0), 0);
                const doneSteps = company.months.reduce((s, m) => s + m.reports.reduce((s2, r) => s2 + r.steps.filter(st => st.status === "done").length, 0), 0);
                const pct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

                return (
                  <tr
                    key={company.id}
                    ref={el => { rowRefs.current[company.id] = el; }}
                    style={{
                      background: isActive ? "#f0f9ff" : cIdx % 2 === 0 ? "#fff" : "#fafbfc",
                      transition: "background 0.2s",
                    }}
                  >
                    {/* ─── 업체명 셀 (sticky) ─── */}
                    <td
                      onClick={() => scrollToRow(company.id)}
                      style={{
                        position: "sticky", left: 0, zIndex: 10,
                        background: isActive ? "#e0f2fe" : cIdx % 2 === 0 ? "#fff" : "#fafbfc",
                        padding: "12px 14px",
                        borderBottom: `1px solid ${COLORS.border}`,
                        borderRight: `2px solid ${COLORS.border}`,
                        cursor: "pointer",
                        transition: "background 0.2s",
                        verticalAlign: "top",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: "0.85rem" }}>{meta.icon}</span>
                        <div>
                          <div style={{
                            fontSize: "0.82rem", fontWeight: 700,
                            color: isActive ? meta.color : "#0f172a",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            maxWidth: 130,
                          }}>{company.shortName}</div>
                          <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600 }}>
                            {company.category} · {company.manager}
                          </div>
                        </div>
                      </div>
                      {/* 진행률 */}
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ flex: 1, height: 4, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{
                            width: `${pct}%`, height: "100%",
                            background: pct === 100 ? COLORS.inProgress : meta.color,
                            borderRadius: 99, transition: "width 0.3s",
                          }} />
                        </div>
                        <span style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 700 }}>{pct}%</span>
                      </div>
                    </td>

                    {/* ─── 월별 셀 ─── */}
                    {MONTHS.map(month => {
                      const monthData = company.months.find(m => m.month === month);
                      const monthIdx = company.months.findIndex(m => m.month === month);

                      return (
                        <td key={month} style={{
                          padding: "10px 12px",
                          borderBottom: `1px solid ${COLORS.border}`,
                          borderRight: `1px solid ${COLORS.border}`,
                          verticalAlign: "top",
                        }}>
                          {monthData && monthData.reports.length > 0 ? (
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {monthData.reports.map((report, rIdx) => (
                                <TaxCard
                                  key={rIdx}
                                  report={report}
                                  onStepToggle={(sIdx) => handleStepToggle(company.id, monthIdx, rIdx, sIdx)}
                                  onBtn={(sIdx) => handleBtn(company.shortName, report.taxType, report.steps[sIdx].label)}
                                />
                              ))}
                            </div>
                          ) : (
                            <div style={{
                              display: "flex", alignItems: "center", justifyContent: "center",
                              minHeight: 60, color: "#d1d5db", fontSize: "0.75rem", fontStyle: "italic",
                            }}>—</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
