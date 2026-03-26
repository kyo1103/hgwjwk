"use client";

import { useState } from "react";

export type DocStatus = "미작성" | "작성중" | "검토완료" | "제출대기" | "제출완료";

type Props = {
    title: string;
    description: string;
    deadline: string; // ISO date string e.g. "2026-03-15"
    govLink?: string;
    govLabel?: string;
    mandatory?: boolean;
    initialStatus?: DocStatus;
};

const STATUS_COLORS: Record<DocStatus, { bg: string; text: string; border: string }> = {
    미작성: { bg: "#f1f5f9", text: "#64748b", border: "#cbd5e1" },
    작성중: { bg: "#fffbeb", text: "#92400e", border: "#fcd34d" },
    검토완료: { bg: "#eff6ff", text: "#1d4ed8", border: "#93c5fd" },
    제출대기: { bg: "#f5f3ff", text: "#6d28d9", border: "#c4b5fd" },
    제출완료: { bg: "#f0fdf4", text: "#166534", border: "#86efac" },
};

const ALL_STATUSES: DocStatus[] = ["미작성", "작성중", "검토완료", "제출대기", "제출완료"];

function getDday(deadline: string): { label: string; urgent: boolean } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(deadline);
    due.setHours(0, 0, 0, 0);
    const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
    if (diff < 0) return { label: `D+${Math.abs(diff)} 경과`, urgent: true };
    if (diff === 0) return { label: "오늘 마감", urgent: true };
    if (diff <= 7) return { label: `D-${diff}`, urgent: true };
    return { label: `D-${diff}`, urgent: false };
}

export function DocumentCard({
    title,
    description,
    deadline,
    govLink,
    govLabel = "정부 사이트 바로가기",
    mandatory = true,
    initialStatus = "미작성",
}: Props) {
    const [status, setStatus] = useState<DocStatus>(initialStatus);
    const [open, setOpen] = useState(false);
    const { label: ddayLabel, urgent } = getDday(deadline);
    const colors = STATUS_COLORS[status];

    return (
        <div style={{
            background: "#fff",
            borderRadius: 14,
            border: `1.5px solid ${status === "제출완료" ? "#86efac" : "#e2e8f0"}`,
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
            padding: "20px 24px",
            transition: "box-shadow 0.2s",
            opacity: status === "제출완료" ? 0.75 : 1,
        }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                {/* Status indicator dot */}
                <div style={{ marginTop: 4, width: 10, height: 10, borderRadius: "50%", flexShrink: 0, background: colors.border }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
                            {title}
                        </span>
                        {mandatory && (
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 4, padding: "2px 7px" }}>
                                법정 필수
                            </span>
                        )}
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                        {description}
                    </p>
                </div>

                {/* D-day badge */}
                <div style={{
                    flexShrink: 0,
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: urgent ? (status === "제출완료" ? "#f0fdf4" : "#fef2f2") : "#f1f5f9",
                    border: `1px solid ${urgent ? (status === "제출완료" ? "#86efac" : "#fca5a5") : "#e2e8f0"}`,
                    textAlign: "center",
                }}>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>마감</div>
                    <div style={{
                        fontSize: "0.9rem", fontWeight: 800,
                        color: urgent && status !== "제출완료" ? "#dc2626" : "#334155",
                        letterSpacing: "-0.01em"
                    }}>
                        {ddayLabel}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                        {new Date(deadline).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                {/* Status selector */}
                <div style={{ position: "relative" }}>
                    <button
                        onClick={() => setOpen(!open)}
                        style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "6px 14px", borderRadius: 8,
                            border: `1.5px solid ${colors.border}`,
                            background: colors.bg, color: colors.text,
                            fontSize: "0.85rem", fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        {status} <span style={{ fontSize: "0.7rem" }}>▾</span>
                    </button>
                    {open && (
                        <div style={{
                            position: "absolute", top: "110%", left: 0, zIndex: 20,
                            background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.1)", overflow: "hidden", minWidth: 120,
                        }}>
                            {ALL_STATUSES.map(s => (
                                <button
                                    key={s}
                                    onClick={() => { setStatus(s); setOpen(false); }}
                                    style={{
                                        display: "block", width: "100%", textAlign: "left",
                                        padding: "10px 16px", border: "none",
                                        background: s === status ? "#f8fafc" : "#fff",
                                        color: STATUS_COLORS[s].text,
                                        fontSize: "0.875rem", fontWeight: s === status ? 700 : 500,
                                        cursor: "pointer",
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ flex: 1 }} />

                {govLink && (
                    <a
                        href={govLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            padding: "7px 14px", borderRadius: 8,
                            border: "1.5px solid #e2e8f0", background: "#f8fafc",
                            color: "#475569", fontSize: "0.85rem", fontWeight: 600,
                            textDecoration: "none", transition: "background 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#e2e8f0")}
                        onMouseLeave={e => (e.currentTarget.style.background = "#f8fafc")}
                    >
                        🔗 {govLabel}
                    </a>
                )}
            </div>
        </div>
    );
}
