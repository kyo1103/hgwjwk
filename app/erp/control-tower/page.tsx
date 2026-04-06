"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  type StepStatus,
  type ReportStep,
  type TaxReport,
  type Company,
  INDUSTRY_META,
  MONTHS,
  MOCK_COMPANIES,
} from "@/lib/control-tower-data";

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
  "성실신고": { bg: "#ffedd5", text: "#ea580c", border: "#fdba74" },
};

/* ─────────────────────────── 서브 컴포넌트 ─────────────────────────── */

function TaxCard({ report, globalStats, onStepToggle, onBtn, onMockConfirm }: {
  report: TaxReport;
  globalStats?: Record<string, { done: number; total: number }>;
  onStepToggle: (i: number) => void;
  onBtn: (i: number) => void;
  onMockConfirm?: (title: string, onConfirm: () => void) => void;
}) {
  const tc = TAX_COLORS[report.taxType] || TAX_COLORS["원천세"];

  // 목업용 상태
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [step3Done, setStep3Done] = useState(false);

  let btn1Label = "자료수집";
  let btn2Label: string | null = "자료요청";
  let labelText = `${report.taxType} 작업중`;
  let btn3Label = "전송";

  if (report.taxType === "원천세") {
    btn1Label = "급여자료 요청";
    btn2Label = null;
    labelText = "급여·원천세 작업중";
    btn3Label = "납부서 전달";
  } else if (report.taxType === "법인세") {
    btn1Label = "자료수집";
    btn2Label = "고객사 자료요청";
    labelText = "결산·세무조정 작업중";
    btn3Label = "납부서·보고서 전송";
  } else if (report.taxType === "종합소득세") {
    btn1Label = "자료수집";
    btn2Label = "고객사 자료요청";
    labelText = "소득세 작업중";
    btn3Label = "납부서 전송";
  } else if (report.taxType === "연말정산") {
    btn1Label = "안내문 발송";
    btn2Label = "소득공제 자료 요청";
    labelText = "정산작업중";
    btn3Label = "원천징수영수증 전달";
  } else if (report.taxType === "부가세") {
    btn1Label = "자료수집";
    btn2Label = "수기자료 요청";
    labelText = "세무사랑 작업중";
    btn3Label = "납부서·보고서 전송";
  }

  const handleAction = (label: string, done: boolean, setDone: (v: boolean) => void) => {
    if (done) return;
    if (onMockConfirm) {
      onMockConfirm(label, () => setDone(true));
    } else {
      setDone(true);
    }
  };

  const isAllDone = btn2Label ? (step1Done && step2Done && step3Done) : (step1Done && step3Done);

  const PillButton = ({ label, done, onClick }: { label: string, done: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      style={{
        padding: "4px 10px", fontSize: "0.68rem", fontWeight: 700,
        borderRadius: 999, border: done ? "none" : `1px solid ${tc.border}`,
        background: done ? tc.text : tc.bg,
        color: done ? "#fff" : tc.text,
        cursor: done ? "default" : "pointer",
        transition: "all 0.2s",
        display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%",
        boxShadow: done ? `0 1px 4px ${tc.text}40` : "none"
      }}
      onMouseEnter={e => {
        if (!done) e.currentTarget.style.filter = "brightness(0.95)";
      }}
      onMouseLeave={e => {
        if (!done) e.currentTarget.style.filter = "none";
      }}
    >
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      {done ? <span style={{ fontSize: "0.65rem", flexShrink: 0, marginLeft: 4 }}>✓</span> : <span style={{ fontSize: "0.65rem", opacity: 0.7, flexShrink: 0, marginLeft: 4 }}>→</span>}
    </button>
  );

  return (
    <div style={{
      border: `1.5px solid ${tc.border}`, borderRadius: 8, background: "#fff",
      overflow: "hidden", width: 175, flexShrink: 0,
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      display: "flex", flexDirection: "column"
    }}>
      <div style={{
        background: tc.bg, padding: "5px 8px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: `1px solid ${tc.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
           <span style={{ fontSize: "0.72rem", fontWeight: 800, color: tc.text }}>{report.taxType}</span>
           {isAllDone ? (
             <span style={{ fontSize: "0.55rem", fontWeight: 800, color: "#fff", background: tc.text, padding: "1px 5px", borderRadius: 4 }}>
               완료
             </span>
           ) : (
             <span style={{ fontSize: "0.55rem", fontWeight: 800, color: tc.text, background: "rgba(255,255,255,0.6)", padding: "1px 5px", borderRadius: 4 }}>
               진행
             </span>
           )}
        </div>
      </div>

      <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: 4, flex: 1, justifyContent: "center" }}>
        
        <PillButton label={btn1Label} done={step1Done} onClick={() => handleAction(btn1Label, step1Done, setStep1Done)} />
        {btn2Label && (
          <PillButton label={btn2Label} done={step2Done} onClick={() => handleAction(btn2Label, step2Done, setStep2Done)} />
        )}

        <div style={{ 
          textAlign: "center", fontSize: "0.65rem", fontWeight: 700, color: "#64748b",
          display: "flex", justifyContent: "center", alignItems: "center", gap: 4,
          padding: "4px 0"
        }}>
          {!isAllDone && (
            <svg style={{ animation: "spin 2s linear infinite", width: 10, height: 10, color: "#94a3b8" }} fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
            </svg>
          )}
          {labelText}
        </div>

        <PillButton label={btn3Label} done={step3Done} onClick={() => handleAction(btn3Label, step3Done, setStep3Done)} />

      </div>
    </div>
  );
}

/* ─────────────────────────── 스타일 상수 ─────────────────────────── */

const STICKY_COL_W = 260;
const MONTH_COL_W = 500;

/* ─────────────────────────── 메인 페이지 ─────────────────────────── */

export default function ControlTowerPage() {
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [activeRow, setActiveRow] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [mockModal, setMockModal] = useState<{ title: string, onConfirm: () => void } | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  // ── 필터 상태 ──
  const [searchQuery, setSearchQuery] = useState("");
  const [filterManager, setFilterManager] = useState("전체");
  const [filterType, setFilterType] = useState("전체");
  const [filterIncompleteOnly, setFilterIncompleteOnly] = useState(false);

  // 담당자 목록 추출
  const managerList = useMemo(() => {
    const set = new Set<string>();
    companies.forEach(c => set.add(c.manager));
    return ["전체", ...Array.from(set).sort()];
  }, [companies]);

  // 필터링된 회사 목록
  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      // 검색 (업체명 또는 사업자번호)
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.bizNo.includes(q)) return false;
      }
      // 담당자
      if (filterManager !== "전체" && c.manager !== filterManager) return false;
      // 구분 (category 기반 - 법인=제조업/수출업, 개인=병의원)
      if (filterType === "법인" && c.category === "병의원") return false;
      if (filterType === "개인" && c.category !== "병의원") return false;
      // 미완료만
      if (filterIncompleteOnly) {
        const totalSteps = c.months.reduce((s, m) => s + m.reports.reduce((s2, r) => s2 + r.steps.length, 0), 0);
        const doneSteps = c.months.reduce((s, m) => s + m.reports.reduce((s2, r) => s2 + r.steps.filter(st => st.status === "done").length, 0), 0);
        if (totalSteps > 0 && doneSteps === totalSteps) return false;
      }
      return true;
    });
  }, [companies, searchQuery, filterManager, filterType, filterIncompleteOnly]);

  const isFilterActive = searchQuery !== "" || filterManager !== "전체" || filterType !== "전체" || filterIncompleteOnly;

  const resetFilters = () => {
    setSearchQuery("");
    setFilterManager("전체");
    setFilterType("전체");
    setFilterIncompleteOnly(false);
  };

  const groupedCompanies = useMemo(() => {
    const groups: Record<string, Company[]> = {};
    filteredCompanies.forEach(c => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });
    return groups;
  }, [filteredCompanies]);

  const withholdingStats = useMemo(() => {
    const stats: Record<string, { done: number; total: number }> = {};
    let overallTotal = 0;
    let overallDone = 0;

    companies.forEach(c => {
      c.months.forEach(m => {
        m.reports.forEach(r => {
          if (r.taxType === "원천세") {
            overallTotal += 1;
            const finishStep = r.steps.find(s => s.label === "납부확인");
            if (finishStep && finishStep.status === "done") overallDone += 1;

            r.steps.forEach(s => {
              if (!stats[s.label]) stats[s.label] = { done: 0, total: 0 };
              stats[s.label].total += 1;
              if (s.status === "done") stats[s.label].done += 1;
            });
          }
        });
      });
    });
    return { steps: stats, overallTotal, overallDone };
  }, [companies]);

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
    <div style={{ padding: "28px 16px", width: "95%", margin: "0 auto", position: "relative" }}>
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

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 4 }}>
          신고 관제탑
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.88rem", margin: 0 }}>
          업체별 · 월별 신고 진행 현황을 스프레드시트 형태로 관리합니다.
        </p>
      </div>

      {/* ─── 우측 화면밖 위치 고정 원천세 현황판 ─── */}
      <div style={{
        position: "fixed", top: 130, right: 30, zIndex: 100, width: 170,
        display: "flex", flexDirection: "column", gap: 12, background: "#fff", padding: "16px",
        borderRadius: 12, border: `1px solid ${COLORS.border}`, boxShadow: "0 4px 16px rgba(0,0,0,0.06)"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, borderBottom: "1px dashed #e2e8f0", paddingBottom: 10 }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: TAX_COLORS["원천세"].text }}>원천세 진행현황</span>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>
            {withholdingStats.overallDone} <span style={{ opacity: 0.4, fontSize: "0.85rem", fontWeight: 700 }}>/ {withholdingStats.overallTotal}</span>
          </div>
          <span style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 600 }}>(납부확인 완료 기준)</span>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {["급여자료 수집", "급여대장 작성", "세무사랑 신고서", "홈택스 신고", "위택스 신고", "납부서 전달", "납부확인"].map((label) => {
            const st = withholdingStats.steps[label] || { done: 0, total: 0 };
            const isDone = st.done === st.total && st.total > 0;
            return (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.68rem", color: "#475569", fontWeight: 600 }}>
                  {label === "세무사랑 신고서" ? "서식변환" : label.split(" ")[label.split(" ").length - 1]}
                </span>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: isDone ? COLORS.done : "#0f172a" }}>
                  {st.done} <span style={{ opacity: 0.5, fontSize: "0.6rem" }}>/ {st.total}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 검색 및 필터 바 ─── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
        padding: "12px 16px", background: "#fff", borderRadius: 10,
        border: `1px solid ${COLORS.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        flexWrap: "wrap"
      }}>
        {/* 검색바 */}
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem", color: "#94a3b8", pointerEvents: "none" }}>🔍</span>
          <input
            type="text"
            placeholder="업체명 또는 사업자번호 검색"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "8px 12px 8px 32px", fontSize: "0.82rem", fontWeight: 600,
              border: "1px solid #e2e8f0", borderRadius: 6, outline: "none", background: "#f8fafc",
              color: "#0f172a", transition: "border-color 0.2s",
            }}
          />
        </div>

        <div style={{ width: 1, height: 26, background: "#e2e8f0", flexShrink: 0 }} />

        {/* 담당자 필터 */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", whiteSpace: "nowrap" }}>담당자</label>
          <select
            value={filterManager}
            onChange={e => setFilterManager(e.target.value)}
            style={{ padding: "6px 10px", fontSize: "0.8rem", fontWeight: 600, border: "1px solid #e2e8f0", borderRadius: 6, background: "#f8fafc", color: "#0f172a", outline: "none", cursor: "pointer" }}
          >
            {managerList.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* 구분 필터 */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", whiteSpace: "nowrap" }}>구분</label>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{ padding: "6px 10px", fontSize: "0.8rem", fontWeight: 600, border: "1px solid #e2e8f0", borderRadius: 6, background: "#f8fafc", color: "#0f172a", outline: "none", cursor: "pointer" }}
          >
            <option value="전체">전체</option>
            <option value="법인">법인</option>
            <option value="개인">개인</option>
          </select>
        </div>

        <div style={{ width: 1, height: 26, background: "#e2e8f0", flexShrink: 0 }} />

        {/* 미완료만 보기 */}
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", userSelect: "none" }}>
          <input
            type="checkbox"
            checked={filterIncompleteOnly}
            onChange={e => setFilterIncompleteOnly(e.target.checked)}
            style={{ width: 15, height: 15, accentColor: "#2563eb", cursor: "pointer" }}
          />
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: filterIncompleteOnly ? "#2563eb" : "#475569" }}>미완료만 보기</span>
        </label>

        {/* 필터 초기화 */}
        {isFilterActive && (
          <button
            onClick={resetFilters}
            style={{
              padding: "6px 14px", fontSize: "0.75rem", fontWeight: 700,
              background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca",
              borderRadius: 6, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap"
            }}
          >
            ✕ 필터 초기화
          </button>
        )}

        {/* 필터 결과 카운트 */}
        <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600, marginLeft: "auto" }}>
          {filteredCompanies.length}개 업체 표시
        </span>
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
              {Object.entries(groupedCompanies).map(([category, groupList]) => {
                const isExpanded = expandedFolders[category] ?? true;
                const toggleFolder = () => setExpandedFolders(p => ({ ...p, [category]: !(p[category] ?? true) }));
                const cateMeta = INDUSTRY_META[category as keyof typeof INDUSTRY_META] || { icon: "📁", color: "#64748b" };

                return (
                  <React.Fragment key={category}>
                    {/* 그룹 헤더(폴더) 행 */}
                    <tr onClick={toggleFolder} style={{ cursor: "pointer", background: "#f8fafc", transition: "background 0.2s" }}>
                      <td style={{
                        position: "sticky", left: 0, zIndex: 30,
                        background: "#e2e8f0", padding: "12px 16px",
                        borderBottom: `2px solid ${COLORS.border}`,
                        borderRight: `2px solid ${COLORS.border}`,
                        fontWeight: 800, color: "#0f172a",
                        display: "flex", alignItems: "center", gap: 8
                      }}>
                        <div style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: 20, height: 20, borderRadius: 4, background: "#cbd5e1",
                          color: "#475569", fontSize: "0.8rem",
                          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s"
                        }}>▶</div>
                        <span style={{ fontSize: "1.1rem" }}>{cateMeta.icon}</span>
                        <span>{category}</span>
                        <span style={{ 
                          background: "#fff", padding: "2px 8px", borderRadius: 99, 
                          fontSize: "0.75rem", color: "#475569", fontWeight: 700 
                        }}>
                          {groupList.length}
                        </span>
                      </td>
                      <td colSpan={MONTHS.length} style={{ borderBottom: `2px solid ${COLORS.border}`, background: "#f8fafc" }} />
                    </tr>
                    
                    {/* 업체 행 (열림 상태일 때) */}
                    {isExpanded && groupList.map((company, cIdx) => {
                      const isActive = activeRow === company.id;
                      const meta = INDUSTRY_META[company.category as keyof typeof INDUSTRY_META];
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
                          {/* ─── 업체명 셀 (sticky) + 들여쓰기 ─── */}
                          <td
                            onClick={() => scrollToRow(company.id)}
                            style={{
                              position: "sticky", left: 0, zIndex: 10,
                              background: isActive ? "#e0f2fe" : cIdx % 2 === 0 ? "#fff" : "#fafbfc",
                              padding: "12px 14px 12px 34px",
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
                                    globalStats={withholdingStats.steps}
                                    onStepToggle={(sIdx) => handleStepToggle(company.id, monthIdx, rIdx, sIdx)}
                                    onBtn={(sIdx) => undefined}
                                    onMockConfirm={(title, onConfirm) => setMockModal({ title, onConfirm })}
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
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mock Modal */}
      {mockModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.4)", zIndex: 100000,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "#fff", padding: "28px 32px", borderRadius: 16, width: 340, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem", color: "#0f172a", fontWeight: 800 }}>작업 상태 변경</h3>
            <p style={{ margin: "0 0 24px 0", fontSize: "0.85rem", color: "#475569", lineHeight: 1.5 }}>
              <strong>{mockModal.title}</strong> 작업을 완료 처리하시겠습니까?
              <br/><span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>(※ 실제 API 호출은 생략된 목업입니다)</span>
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button 
                onClick={() => setMockModal(null)} 
                style={{ padding: "8px 16px", background: "#f1f5f9", border: "none", borderRadius: 8, color: "#475569", cursor: "pointer", fontWeight: 700, transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#e2e8f0"}
                onMouseLeave={e => e.currentTarget.style.background = "#f1f5f9"}
              >
                취소
              </button>
              <button 
                onClick={() => {
                  mockModal.onConfirm();
                  setMockModal(null);
                  showToast(`"${mockModal.title}" 완료`);
                }} 
                style={{ padding: "8px 16px", background: "#2563eb", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontWeight: 700, transition: "background 0.2s", boxShadow: "0 4px 12px rgba(37,99,235,0.2)" }}
                onMouseEnter={e => e.currentTarget.style.background = "#1d4ed8"}
                onMouseLeave={e => e.currentTarget.style.background = "#2563eb"}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
