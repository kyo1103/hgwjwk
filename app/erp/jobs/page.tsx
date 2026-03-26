"use client";

import { useState, useTransition } from "react";
import ERPStatusBadge from "@/components/erp/ERPStatusBadge";
import ChannelBadge from "@/components/erp/ChannelBadge";
import type { ERPJob } from "@/lib/erp-types";
import { useERPState } from "@/lib/use-erp-state";

function RetryButton({ jobId, onDone }: { jobId: string; onDone: () => Promise<void> | void }) {
    const [isPending, startTransition] = useTransition();
    const [done, setDone] = useState(false);

    const handleRetry = () => {
        startTransition(async () => {
            await fetch(`/api/jobs/${jobId}/retry`, { method: "POST" });
            await onDone();
            setDone(true);
            setTimeout(() => setDone(false), 4000);
        });
    };

    return (
        <button onClick={handleRetry} disabled={isPending} style={{
            padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer",
            background: done ? "#16a34a" : isPending ? "#94a3b8" : "#ef4444",
            color: "#fff", fontSize: "0.75rem", fontWeight: 600,
        }}>
            {done ? "✓ 요청됨" : isPending ? "..." : "🔁 재시도"}
        </button>
    );
}

export default function JobsPage() {
    const { data, isLoading, error, refresh } = useERPState();
    const erpJobs = data?.jobs ?? [];
    const erpClients = data?.clients ?? [];
    const [statusFilter, setStatusFilter] = useState<"all" | "RUNNING" | "SUCCESS" | "FAILED" | "NEED_LOGIN" | "NEED_CONSENT">("all");

    const filtered = erpJobs.filter((j) => statusFilter === "all" || j.status === statusFilter);

    const counts = {
        all: erpJobs.length,
        RUNNING: erpJobs.filter((j) => j.status === "RUNNING").length,
        SUCCESS: erpJobs.filter((j) => j.status === "SUCCESS").length,
        FAILED: erpJobs.filter((j) => j.status === "FAILED").length,
        NEED_LOGIN: erpJobs.filter((j) => j.status === "NEED_LOGIN").length,
        NEED_CONSENT: erpJobs.filter((j) => j.status === "NEED_CONSENT").length,
    };

    const statusTabs = [
        { key: "all", label: "전체" },
        { key: "RUNNING", label: "수집중" },
        { key: "SUCCESS", label: "완료" },
        { key: "FAILED", label: "실패" },
        { key: "NEED_LOGIN", label: "로그인필요" },
        { key: "NEED_CONSENT", label: "동의필요" },
    ] as const;

    if (isLoading && !data) {
        return <div style={{ padding: "36px 40px", color: "#64748b" }}>작업 상태를 불러오는 중...</div>;
    }

    return (
        <div style={{ padding: "36px 40px" }}>
            {error && (
                <div style={{
                    marginBottom: 16, padding: "10px 14px", borderRadius: 10,
                    background: "#fff7ed", border: "1px solid #fdba74", color: "#9a3412",
                    fontSize: "0.82rem",
                }}>
                    상태 동기화 오류: {error}
                </div>
            )}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.04em" }}>작업 현황</h1>
                <p style={{ color: "#64748b", fontSize: "0.88rem", marginTop: 4 }}>수집 작업 큐 및 재시도 관리</p>
            </div>

            {/* Status Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {statusTabs.map(({ key, label }) => (
                    <button key={key} onClick={() => setStatusFilter(key)} style={{
                        padding: "8px 16px", borderRadius: 10, border: "1px solid",
                        borderColor: statusFilter === key ? "#2563eb" : "#e2e8f0",
                        background: statusFilter === key ? "#eff6ff" : "#fff",
                        color: statusFilter === key ? "#1d4ed8" : "#64748b",
                        fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                    }}>
                        {label} {counts[key] > 0 && <span style={{ marginLeft: 4, background: "#f1f5f9", borderRadius: 99, padding: "1px 6px", fontSize: "0.72rem" }}>{counts[key]}</span>}
                    </button>
                ))}
            </div>

            {/* Jobs List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filtered.length === 0 && (
                    <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8", background: "#fff", borderRadius: 16 }}>
                        해당 상태의 작업이 없습니다.
                    </div>
                )}
                {filtered.map((job: ERPJob) => {
                    const client = erpClients.find((c) => c.id === job.clientId);
                    const canRetry = job.status === "FAILED" || job.status === "NEED_LOGIN" || job.status === "NEED_CONSENT";
                    return (
                        <div key={job.id} style={{
                            background: "#fff", borderRadius: 14, padding: "20px 24px",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                            borderLeft: `4px solid ${job.status === "SUCCESS" ? "#22c55e" :
                                    job.status === "RUNNING" ? "#3b82f6" :
                                        job.status === "FAILED" || job.status === "NEED_LOGIN" || job.status === "NEED_CONSENT" ? "#ef4444" : "#94a3b8"
                                }`,
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                                        <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>{client?.name ?? job.clientId}</p>
                                        <ERPStatusBadge status={job.status} />
                                    </div>
                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                                        {job.scope.map((ch) => <ChannelBadge key={ch} channel={ch} size="sm" />)}
                                    </div>
                                    {job.resultMessage && (
                                        <p style={{ fontSize: "0.8rem", color: job.status === "SUCCESS" ? "#16a34a" : "#dc2626", marginTop: 4 }}>
                                            {job.status === "SUCCESS" ? "✓" : "✕"} {job.resultMessage}
                                        </p>
                                    )}
                                    <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: "0.75rem", color: "#94a3b8" }}>
                                        <span>요청: {new Date(job.requestedAt).toLocaleString("ko-KR")}</span>
                                        {job.finishedAt && <span>완료: {new Date(job.finishedAt).toLocaleString("ko-KR")}</span>}
                                        <span style={{ fontFamily: "monospace", fontSize: "0.68rem" }}>ID: {job.id}</span>
                                    </div>
                                </div>
                                {canRetry && <RetryButton jobId={job.id} onDone={refresh} />}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
