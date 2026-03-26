"use client";
import type { ConnectorStatus } from "@/lib/erp-types";

const config: Record<ConnectorStatus, { label: string; bg: string; color: string; dot?: string }> = {
    READY: { label: "준비", bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8" },
    RUNNING: { label: "수집중", bg: "#eff6ff", color: "#2563eb", dot: "#3b82f6" },
    SUCCESS: { label: "완료", bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e" },
    FAILED: { label: "실패", bg: "#fff1f2", color: "#dc2626", dot: "#ef4444" },
    NEED_LOGIN: { label: "로그인필요", bg: "#fff7ed", color: "#c2410c", dot: "#f97316" },
    NEED_CONSENT: { label: "동의필요", bg: "#faf5ff", color: "#7c3aed", dot: "#a855f7" },
};

export default function ERPStatusBadge({
    status,
    size = "md",
}: {
    status: ConnectorStatus;
    size?: "sm" | "md";
}) {
    const c = config[status];
    const isRunning = status === "RUNNING";

    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: c.bg, color: c.color,
            borderRadius: 99,
            padding: size === "sm" ? "2px 8px" : "4px 10px",
            fontSize: size === "sm" ? "0.72rem" : "0.8rem",
            fontWeight: 600, whiteSpace: "nowrap",
            fontFamily: "Pretendard, sans-serif",
            border: "1px solid rgba(148, 163, 184, 0.12)",
        }}>
            <span style={{
                width: size === "sm" ? 5 : 6,
                height: size === "sm" ? 5 : 6,
                borderRadius: "50%",
                background: c.dot,
                flexShrink: 0,
                animation: isRunning ? "pulse 1.5s ease-in-out infinite" : "none",
            }} />
            {c.label}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        </span>
    );
}
