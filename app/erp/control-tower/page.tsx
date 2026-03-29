"use client";

import { useState } from "react";
import Link from "next/link";

type TabType = "원천세" | "부가세" | "법인세" | "종합소득세" | "연말정산";

const TABS: TabType[] = ["원천세", "부가세", "법인세", "종합소득세", "연말정산"];

const WITHHOLDING_STEPS = [
    "급여자료 미수집",
    "급여대장 작성완료",
    "세무사랑 신고서 작성",
    "홈택스 원천세 신고완료",
    "위택스 지방소득세 신고완료",
    "납부서 전달",
    "납부 확인",
    "간이지급명세서 제출"
];

const VAT_STEPS = [
    "API 자동수집 완료",
    "고객사 수기증빙 미제출",
    "자료 수집 완료",
    "자동가공 완료",
    "세무사랑 장부반영 중",
    "검토/세무조정 중",
    "홈택스 신고완료",
    "납부서 전달",
    "납부 확인",
    "분석보고서 전달"
];

const CORP_TAX_STEPS = [
    "API 자동수집 완료",
    "고객사 자료 미제출",
    "자료 수집 완료",
    "자동가공 완료",
    "결산/재무제표 확정",
    "세무사랑 장부반영",
    "세무조정",
    "대표세무사 최종 검토",
    "홈택스 신고완료",
    "위택스 지방소득세 신고",
    "납부서 전달",
    "납부 확인",
    "분석보고서 전달"
];

const INCOME_TAX_STEPS = [
    "API 자동수집 완료",
    "고객사 자료 미제출",
    "자료 수집 완료",
    "자동가공 완료",
    "세무사랑 장부반영",
    "소득금액 확정",
    "세무조정/소득공제",
    "홈택스 신고완료",
    "위택스 지방소득세 신고",
    "납부서 전달",
    "납부 확인"
];

const YEAREND_TAX_STEPS = [
    "연말정산 안내문 발송",
    "소득공제 자료 수집 중",
    "자료 수집 완료",
    "공제항목 검토",
    "세무사랑 정산 작업",
    "원천징수영수증 생성",
    "환급/추징액 확정",
    "고객사 전달",
    "완료"
];

const INITIAL_MOCK_DATA: Record<TabType, any[]> = {
    "원천세": [
        { id: "1", name: "유니온테크 주식회사", bizNo: "123-45-12345", manager: "김노무", stepIndex: 0, status: "급여자료 미수집" },
        { id: "2", name: "주식회사 데이터솔루션", bizNo: "234-56-78901", manager: "이세무", stepIndex: 3, status: "홈택스 원천세 신고완료" },
        { id: "3", name: "코스모스 카페", bizNo: "345-67-89012", manager: "박대리", stepIndex: 1, status: "급여대장 작성완료" },
        { id: "4", name: "에이스 건설", bizNo: "456-78-90123", manager: "김노무", stepIndex: 7, status: "간이지급명세서 제출" },
        { id: "5", name: "스타트업 홀딩스", bizNo: "567-89-01234", manager: "최주임", stepIndex: 5, status: "납부서 전달" },
    ],
    "부가세": [
        { id: "6", name: "유니온테크 주식회사", bizNo: "123-45-12345", manager: "이세무", stepIndex: 0, status: "API 자동수집 완료" },
        { id: "7", name: "코스모스 카페", bizNo: "345-67-89012", manager: "박대리", stepIndex: 1, status: "고객사 수기증빙 미제출" },
        { id: "8", name: "주식회사 데이터솔루션", bizNo: "234-56-78901", manager: "김노무", stepIndex: 4, status: "세무사랑 장부반영 중" },
        { id: "9", name: "에이스 건설", bizNo: "456-78-90123", manager: "최주임", stepIndex: 9, status: "분석보고서 전달" },
        { id: "12", name: "스타트업 홀딩스", bizNo: "567-89-01234", manager: "최주임", stepIndex: 6, status: "홈택스 신고완료" },
    ],
    "법인세": [
        { id: "13", name: "유니온테크 주식회사", bizNo: "123-45-12345", manager: "이세무", stepIndex: 0, status: "API 자동수집 완료" },
        { id: "14", name: "에이스 건설", bizNo: "456-78-90123", manager: "최주임", stepIndex: 4, status: "결산/재무제표 확정" },
        { id: "15", name: "주식회사 데이터솔루션", bizNo: "234-56-78901", manager: "김노무", stepIndex: 7, status: "대표세무사 최종 검토" },
        { id: "16", name: "코스모스 카페", bizNo: "345-67-89012", manager: "박대리", stepIndex: 11, status: "납부 확인" },
    ],
    "종합소득세": [
        { id: "17", name: "코스모스 카페", bizNo: "345-67-89012", manager: "박대리", stepIndex: 0, status: "API 자동수집 완료" },
        { id: "18", name: "별빛식당", bizNo: "456-78-90123", manager: "최주임", stepIndex: 3, status: "자동가공 완료" },
        { id: "19", name: "하늘무역", bizNo: "567-89-01234", manager: "이세무", stepIndex: 6, status: "세무조정/소득공제" },
        { id: "20", name: "바다유통", bizNo: "678-90-12345", manager: "김노무", stepIndex: 9, status: "납부서 전달" },
    ],
    "연말정산": [
        { id: "21", name: "주식회사 데이터솔루션", bizNo: "234-56-78901", manager: "이세무", stepIndex: 0, status: "연말정산 안내문 발송" },
        { id: "22", name: "에이스 건설", bizNo: "456-78-90123", manager: "최주임", stepIndex: 3, status: "공제항목 검토" },
        { id: "23", name: "스타트업 홀딩스", bizNo: "567-89-01234", manager: "김노무", stepIndex: 6, status: "환급/추징액 확정" },
        { id: "24", name: "유니온테크 주식회사", bizNo: "123-45-12345", manager: "박대리", stepIndex: 8, status: "완료" },
    ]
};

function ProgressBar({ stepIndex, steps }: { stepIndex: number, steps: string[] }) {
    if (steps.length === 0) return null;
    const isFinished = stepIndex === steps.length - 1;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 500 }}>
            <div style={{ display: "flex", gap: "4px", width: "100%" }}>
                {steps.map((step, idx) => {
                    const isCompleted = idx <= stepIndex;
                    const isCurrent = idx === stepIndex;
                    let bgColor = "#e2e8f0"; // default grey
                    if (isCompleted) bgColor = "#bfdbfe"; // light blue
                    if (isCurrent) bgColor = "#3b82f6"; // blue
                    if (isFinished && isCompleted) bgColor = "#22c55e"; // green if all done

                    return (
                        <div 
                            key={idx} 
                            title={step}
                            style={{ 
                                flex: 1, 
                                height: "8px", 
                                background: bgColor,
                                borderRadius: "4px",
                                transition: "all 0.3s ease"
                            }} 
                        />
                    )
                })}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
                <span>{steps[0]}</span>
                <span>{steps[steps.length - 1]}</span>
            </div>
        </div>
    );
}

export default function ControlTowerPage() {
    const [activeTab, setActiveTab] = useState<TabType>("원천세");
    const [dataStore, setDataStore] = useState(INITIAL_MOCK_DATA);
    const [editingRowId, setEditingRowId] = useState<string | null>(null);

    const currentData = dataStore[activeTab] || [];
    const stepsArray = activeTab === "원천세" ? WITHHOLDING_STEPS : activeTab === "부가세" ? VAT_STEPS : activeTab === "법인세" ? CORP_TAX_STEPS : activeTab === "종합소득세" ? INCOME_TAX_STEPS : activeTab === "연말정산" ? YEAREND_TAX_STEPS : [];

    const updateStep = (rowId: string, newStepIndex: number) => {
        if (stepsArray.length === 0) return;
        
        const newStatus = stepsArray[newStepIndex] || stepsArray[0];

        setDataStore(prev => {
            const list = [...prev[activeTab]];
            const idx = list.findIndex(r => r.id === rowId);
            if (idx !== -1) {
                list[idx] = { ...list[idx], stepIndex: newStepIndex, status: newStatus };
            }
            return { ...prev, [activeTab]: list };
        });
        setEditingRowId(null);
    };

    return (
        <div style={{ padding: "36px 40px", maxWidth: 1400, margin: "0 auto" }}>
            {/* Breadcrumb */}
            <div style={{ marginBottom: 20, display: "flex", gap: 6, alignItems: "center", fontSize: "0.82rem", color: "#94a3b8" }}>
                <Link href="/erp" style={{ color: "#94a3b8", textDecoration: "none" }}>대시보드</Link>
                <span>/</span>
                <span style={{ color: "#0f172a", fontWeight: 600 }}>신고 관제탑</span>
            </div>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 8 }}>
                    세목별 신고 관제탑
                </h1>
                <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
                    전체 고객사의 세부 단계 상태를 변경하며 원클릭으로 손쉽게 관리할 수 있습니다.
                </p>
            </div>

            {/* Content Container */}
            <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                {/* Tabs */}
                <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", padding: "0 24px", background: "#f8fafc" }}>
                    {TABS.map((tab) => {
                        const count = dataStore[tab].length;
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: "16px 20px", border: "none", background: "none", cursor: "pointer",
                                    fontSize: "0.95rem", fontWeight: isActive ? 700 : 500,
                                    color: isActive ? "#2563eb" : "#64748b",
                                    borderBottom: isActive ? "3px solid #2563eb" : "3px solid transparent",
                                    display: "flex", alignItems: "center", gap: 8, marginBottom: -1,
                                    transition: "all 0.2s ease"
                                }}
                            >
                                {tab}
                                <span style={{
                                    padding: "2px 8px", borderRadius: 99,
                                    background: isActive ? "#eff6ff" : "#e2e8f0",
                                    color: isActive ? "#2563eb" : "#64748b",
                                    fontSize: "0.75rem", fontWeight: 700,
                                }}>{count}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Table */}
                <div style={{ padding: "0", minHeight: 400 }}>
                    {currentData.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "64px 0", color: "#94a3b8" }}>
                            <p style={{ fontSize: "0.95rem" }}>해당 세목에 진행 중인 고객사가 없습니다.</p>
                        </div>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#fdfdfd", borderBottom: "1px solid #e2e8f0" }}>
                                    <th style={{ textAlign: "left", padding: "16px 24px", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, width: "20%" }}>고객사명</th>
                                    <th style={{ textAlign: "left", padding: "16px 24px", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, width: "15%" }}>사업자번호</th>
                                    <th style={{ textAlign: "left", padding: "16px 24px", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, width: "10%" }}>담당직원</th>
                                    <th style={{ textAlign: "left", padding: "16px 24px", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, width: "55%" }}>현재 상태 (클릭하여 변경)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((row) => (
                                    <tr key={row.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "#f8fafc"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                                        <td style={{ padding: "16px 24px", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>
                                            {row.name}
                                        </td>
                                        <td style={{ padding: "16px 24px", fontSize: "0.85rem", color: "#64748b", fontFamily: "monospace" }}>
                                            {row.bizNo}
                                        </td>
                                        <td style={{ padding: "16px 24px" }}>
                                            <span style={{ 
                                                display: "inline-block", background: "#f1f5f9", color: "#475569", 
                                                padding: "4px 10px", borderRadius: 6, fontSize: "0.8rem", fontWeight: 600 
                                            }}>
                                                {row.manager}
                                            </span>
                                        </td>
                                        <td 
                                            style={{ padding: "16px 24px", cursor: stepsArray.length > 0 ? "pointer" : "default" }} 
                                            onClick={() => {
                                                if (stepsArray.length > 0) setEditingRowId(row.id);
                                            }}
                                        >
                                            {stepsArray.length > 0 ? (
                                                <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 500 }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        {editingRowId === row.id ? (
                                                            <div style={{ width: "100%", marginRight: 12 }}>
                                                                <select 
                                                                    autoFocus
                                                                    value={row.stepIndex}
                                                                    onChange={(e) => updateStep(row.id, parseInt(e.target.value))}
                                                                    onBlur={() => setEditingRowId(null)}
                                                                    style={{
                                                                        padding: "6px 12px", borderRadius: 6, border: "1px solid #94a3b8",
                                                                        fontSize: "0.85rem", color: "#0f172a", outline: "none", width: "100%",
                                                                        cursor: "pointer", background: "#fff"
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    {stepsArray.map((step, idx) => (
                                                                        <option key={idx} value={idx}>{idx + 1}. {step}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        ) : (
                                                            <span style={{ 
                                                                fontSize: "0.85rem", fontWeight: 700, 
                                                                color: row.stepIndex === stepsArray.length - 1 ? "#16a34a" : "#3b82f6",
                                                                display: "flex", alignItems: "center", gap: 6,
                                                                padding: "4px 0"
                                                            }}>
                                                                {row.status}
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                                                                    <path d="M6 9l6 6 6-6"/>
                                                                </svg>
                                                            </span>
                                                        )}
                                                        <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, display: editingRowId === row.id ? "none" : "block" }}>
                                                            {row.stepIndex + 1} / {stepsArray.length}
                                                        </span>
                                                    </div>
                                                    <ProgressBar stepIndex={row.stepIndex} steps={stepsArray} />
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3b82f6" }}>
                                                    {row.status}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
