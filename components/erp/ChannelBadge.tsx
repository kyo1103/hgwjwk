"use client";
import type { ChannelKey } from "@/lib/erp-types";

const config: Record<ChannelKey, { label: string; code: string; bg: string; color: string }> = {
    hometax: { label: "홈택스", code: "HT", bg: "#eff6ff", color: "#1d4ed8" },
    fourInsure: { label: "4대보험", code: "4I", bg: "#f0fdf4", color: "#15803d" },
    gov24: { label: "정부24", code: "G24", bg: "#fff7ed", color: "#c2410c" },
    wetax: { label: "위택스", code: "WT", bg: "#faf5ff", color: "#7c3aed" },
};

export default function ChannelBadge({
    channel,
    size = "md",
}: {
    channel: ChannelKey;
    size?: "sm" | "md";
}) {
    const c = config[channel];
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: c.bg, color: c.color,
            borderRadius: 99,
            padding: size === "sm" ? "2px 8px" : "4px 10px",
            fontSize: size === "sm" ? "0.72rem" : "0.8rem",
            fontWeight: 600, whiteSpace: "nowrap",
            fontFamily: "Pretendard, sans-serif",
        }}>
            <span style={{
                minWidth: size === "sm" ? 20 : 24,
                height: size === "sm" ? 18 : 20,
                borderRadius: 10,
                background: "rgba(255,255,255,0.65)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: size === "sm" ? "0.62rem" : "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
            }}>
                {c.code}
            </span>
            {c.label}
        </span>
    );
}
