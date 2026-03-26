"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import ERPStatusBadge from "@/components/erp/ERPStatusBadge";
import ChannelBadge from "@/components/erp/ChannelBadge";
import type { ChannelKey } from "@/lib/erp-types";
import { useERPState } from "@/lib/use-erp-state";

const channelKeys: ChannelKey[] = ["hometax", "fourInsure", "gov24", "wetax"];

interface BridgeJob {
    status: "queued" | "running" | "done" | "failed";
    logs?: string[];
    files?: { fileName: string; documentType: string }[];
    error?: string;
}

function LiveLogPanel({
    bridgeJobId,
    onDone,
}: {
    bridgeJobId: string;
    onDone: (success: boolean) => void;
}) {
    const [job, setJob] = useState<BridgeJob | null>(null);
    const logRef = useRef<HTMLDivElement>(null);
    const doneRef = useRef(false);

    useEffect(() => {
        if (!bridgeJobId) return;

        let cancelled = false;

        const poll = async () => {
            if (cancelled) return;

            try {
                const res = await fetch(`/api/bridge/jobs/${bridgeJobId}`, { cache: "no-store" });
                const data = await res.json();
                if (!data.ok || !data.job) {
                    setTimeout(poll, 1500);
                    return;
                }

                setJob(data.job);
                if (data.job.status === "done" || data.job.status === "failed") {
                    if (!doneRef.current) {
                        doneRef.current = true;
                        onDone(data.job.status === "done");
                    }
                    return;
                }

                setTimeout(poll, 1200);
            } catch {
                setTimeout(poll, 2000);
            }
        };

        void poll();

        return () => {
            cancelled = true;
        };
    }, [bridgeJobId, onDone]);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [job?.logs?.length]);

    if (!job) {
        return (
            <div style={{
                marginTop: 12, padding: "10px 14px", background: "#f8fafc",
                borderRadius: 8, fontSize: "0.78rem", color: "#64748b",
            }}>
                에이전트 연결 중...
            </div>
        );
    }

    const isDone = job.status === "done" || job.status === "failed";
    const borderColor = job.status === "done" ? "#22c55e" : job.status === "failed" ? "#ef4444" : "#3b82f6";

    return (
        <div style={{
            marginTop: 12, borderRadius: 10, border: `1px solid ${borderColor}`,
            background: "#0f172a", overflow: "hidden",
        }}>
            <div style={{
                padding: "8px 14px", background: `${borderColor}22`,
                borderBottom: `1px solid ${borderColor}33`,
                fontSize: "0.75rem", fontWeight: 700,
                color: isDone ? (job.status === "done" ? "#22c55e" : "#ef4444") : "#60a5fa",
            }}>
                {job.status === "queued" && "대기 중"}
                {job.status === "running" && "수집 진행 중..."}
                {job.status === "done" && `수집 완료 (${job.files?.length ?? 0}건)`}
                {job.status === "failed" && `오류: ${job.error ?? "알 수 없는 오류"}`}
            </div>
            <div
                ref={logRef}
                style={{
                    padding: "10px 14px", maxHeight: 160, overflowY: "auto",
                    fontFamily: "monospace", fontSize: "0.72rem", lineHeight: 1.6,
                    color: "#94a3b8",
                }}
            >
                {(job.logs ?? []).map((line, index) => (
                    <div key={`${bridgeJobId}-${index}`}>{line}</div>
                ))}
            </div>
        </div>
    );
}

function CollectButton({
    clientId,
    scope,
    onJobDone,
}: {
    clientId: string;
    scope: ChannelKey[];
    onJobDone: () => void;
}) {
    const [isPending, startTransition] = useTransition();
    const [bridgeJobId, setBridgeJobId] = useState<string | null>(null);
    const [finished, setFinished] = useState<boolean | null>(null);

    const label = scope.length === channelKeys.length
        ? "전체 기관 일괄 수집"
        : `${scope.join(" + ")} 수집`;

    const handleRun = () => {
        setFinished(null);
        setBridgeJobId(null);

        startTransition(async () => {
            const res = await fetch(`/api/clients/${clientId}/jobs/run`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ scope }),
            });
            const job = await res.json();
            if (job.bridgeJobId) {
                setBridgeJobId(job.bridgeJobId);
            } else {
                setFinished(false);
                onJobDone();
                setTimeout(() => setFinished(null), 6000);
            }
        });
    };

    const handleDone = useCallback((success: boolean) => {
        setFinished(success);
        onJobDone();
        setTimeout(() => {
            setBridgeJobId(null);
            setFinished(null);
        }, 8000);
    }, [onJobDone]);

    const isActive = isPending || !!bridgeJobId;

    return (
        <div style={{ minWidth: 220 }}>
            <button
                onClick={handleRun}
                disabled={isActive}
                style={{
                    padding: "10px 20px", borderRadius: 10, border: "none",
                    cursor: isActive ? "default" : "pointer",
                    background: isActive ? "#94a3b8" : "#2563eb",
                    color: "#fff", fontSize: "0.88rem", fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 8, width: "100%",
                }}
            >
                {isActive ? "수집 중..." : label}
            </button>

            {bridgeJobId && <LiveLogPanel bridgeJobId={bridgeJobId} onDone={handleDone} />}
            {finished === true && !bridgeJobId && (
                <p style={{ marginTop: 8, fontSize: "0.8rem", color: "#16a34a", fontWeight: 600 }}>
                    수집 완료 후 문서 목록이 갱신되었습니다.
                </p>
            )}
            {finished === false && !bridgeJobId && (
                <p style={{ marginTop: 8, fontSize: "0.8rem", color: "#dc2626", fontWeight: 600 }}>
                    수집 실패. 작업 로그를 확인하세요.
                </p>
            )}
        </div>
    );
}

export default function ClientDetailPage({ params }: { params: { id: string } }) {
    const { data, isLoading, error, refresh } = useERPState();
    const erpClients = data?.clients ?? [];
    const erpDocuments = data?.documents ?? [];
    const erpJobs = data?.jobs ?? [];
    const client = erpClients.find((item) => item.id === params.id);
    const [activeTab, setActiveTab] = useState<ChannelKey>("hometax");

    const docs = erpDocuments.filter((document) => document.clientId === params.id);
    const clientJobs = erpJobs.filter((job) => job.clientId === params.id);
    const failedJobs = clientJobs.filter((job) =>
        job.status === "FAILED" || job.status === "NEED_LOGIN" || job.status === "NEED_CONSENT",
    );
    const tabDocs = docs.filter((document) => document.channelKey === activeTab);

    const handleJobDone = useCallback(() => {
        setTimeout(() => {
            void refresh();
        }, 2000);
    }, [refresh]);

    if (isLoading && !data) {
        return <div style={{ padding: "36px 40px", color: "#64748b" }}>사업장 상세를 불러오는 중...</div>;
    }

    if (!client) {
        return (
            <div style={{ padding: "36px 40px" }}>
                <h1 style={{ color: "#ef4444" }}>사업장을 찾을 수 없습니다.</h1>
                <Link href="/erp/clients" style={{ color: "#3b82f6" }}>목록으로</Link>
            </div>
        );
    }

    return (
        <div style={{ padding: "36px 40px", maxWidth: 1200 }}>
            {error && (
                <div style={{
                    marginBottom: 16, padding: "10px 14px", borderRadius: 10,
                    background: "#fff7ed", border: "1px solid #fdba74", color: "#9a3412",
                    fontSize: "0.82rem",
                }}>
                    상태 동기화 오류: {error}
                </div>
            )}

            <div style={{ marginBottom: 20, display: "flex", gap: 6, alignItems: "center", fontSize: "0.82rem", color: "#94a3b8" }}>
                <Link href="/erp" style={{ color: "#94a3b8", textDecoration: "none" }}>대시보드</Link>
                <span>/</span>
                <Link href="/erp/clients" style={{ color: "#94a3b8", textDecoration: "none" }}>사업장 목록</Link>
                <span>/</span>
                <span style={{ color: "#0f172a", fontWeight: 600 }}>{client.name}</span>
            </div>

            <div style={{
                background: "#fff", borderRadius: 16, padding: "28px 32px",
                marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.04em" }}>
                                {client.name}
                            </h1>
                            <span style={{
                                padding: "4px 12px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 700,
                                background: client.mandateStatus === "ACTIVE" ? "#f0fdf4" : "#f8fafc",
                                color: client.mandateStatus === "ACTIVE" ? "#16a34a" : "#94a3b8",
                            }}>
                                {client.mandateStatus === "ACTIVE" ? "수임 활성" : "비활성"}
                            </span>
                        </div>
                        <div style={{ display: "flex", gap: 24, fontSize: "0.85rem", color: "#64748b" }}>
                            <span>사업자번호 {client.bizNo}</span>
                            <span>담당 {client.manager}</span>
                            <span>마지막 수집 {client.lastRunAt ? new Date(client.lastRunAt).toLocaleString("ko-KR") : "없음"}</span>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <CollectButton clientId={client.id} scope={["hometax", "fourInsure"]} onJobDone={handleJobDone} />
                        <CollectButton clientId={client.id} scope={channelKeys} onJobDone={handleJobDone} />
                    </div>
                </div>

                <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {channelKeys.map((channel) => (
                        <div key={channel} style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "10px 16px", borderRadius: 12, background: "#f8fafc",
                        }}>
                            <ChannelBadge channel={channel} size="sm" />
                            <ERPStatusBadge status={client.channels[channel]} size="sm" />
                        </div>
                    ))}
                </div>
            </div>

            {failedJobs.length > 0 && (
                <div style={{
                    background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12,
                    padding: "16px 20px", marginBottom: 24,
                }}>
                    <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#dc2626", marginBottom: 10 }}>실패 로그</p>
                    {failedJobs.map((job) => (
                        <div key={job.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #fecaca" }}>
                            <span style={{ fontSize: "0.82rem", color: "#7f1d1d" }}>
                                [{new Date(job.finishedAt ?? job.requestedAt).toLocaleString("ko-KR")}] {job.resultMessage || "알 수 없는 오류"}
                            </span>
                            <ERPStatusBadge status={job.status} size="sm" />
                        </div>
                    ))}
                </div>
            )}

            <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", padding: "0 24px" }}>
                    {channelKeys.map((channel) => {
                        const count = docs.filter((document) => document.channelKey === channel).length;
                        return (
                            <button
                                key={channel}
                                onClick={() => setActiveTab(channel)}
                                style={{
                                    padding: "16px 20px", border: "none", background: "none", cursor: "pointer",
                                    fontSize: "0.88rem", fontWeight: activeTab === channel ? 700 : 400,
                                    color: activeTab === channel ? "#2563eb" : "#64748b",
                                    borderBottom: activeTab === channel ? "2px solid #2563eb" : "2px solid transparent",
                                    display: "flex", alignItems: "center", gap: 6, marginBottom: -1,
                                }}
                            >
                                {channel}
                                <span style={{
                                    padding: "2px 6px", borderRadius: 99,
                                    background: activeTab === channel ? "#eff6ff" : "#f1f5f9",
                                    color: activeTab === channel ? "#2563eb" : "#94a3b8",
                                    fontSize: "0.72rem", fontWeight: 700,
                                }}>{count}</span>
                            </button>
                        );
                    })}
                </div>

                <div style={{ padding: 24 }}>
                    {tabDocs.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
                            <p style={{ fontSize: "0.9rem" }}>수집된 문서가 없습니다.</p>
                        </div>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    {["문서종류", "기준연월", "파일명", "저장경로", "생성일시", "액션"].map((header) => (
                                        <th key={header} style={{ textAlign: "left", padding: "8px 12px", fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tabDocs.map((doc) => (
                                    <tr key={doc.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                                        <td style={{ padding: "12px", fontSize: "0.84rem", fontWeight: 600, color: "#0f172a" }}>{doc.documentType}</td>
                                        <td style={{ padding: "12px", fontSize: "0.82rem", color: "#64748b" }}>{doc.baseYm}</td>
                                        <td style={{ padding: "12px", fontSize: "0.75rem", color: "#374151", fontFamily: "monospace", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {doc.fileName}
                                        </td>
                                        <td style={{ padding: "12px", fontSize: "0.72rem", color: "#94a3b8", fontFamily: "monospace" }}>
                                            {doc.filePath}
                                        </td>
                                        <td style={{ padding: "12px", fontSize: "0.78rem", color: "#94a3b8", whiteSpace: "nowrap" }}>
                                            {new Date(doc.createdAt).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                        </td>
                                        <td style={{ padding: "12px" }}>
                                            <div style={{ display: "flex", gap: 6 }}>
                                                <a
                                                    href={doc.downloadUrl ?? doc.filePath}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        padding: "5px 10px", borderRadius: 6, border: "1px solid #bfdbfe",
                                                        background: "#eff6ff", fontSize: "0.75rem", cursor: "pointer",
                                                        color: "#1d4ed8", fontWeight: 600, textDecoration: "none",
                                                    }}
                                                >
                                                    다운로드
                                                </a>
                                            </div>
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
