"use client";

import { useERPState } from "@/lib/use-erp-state";

const channels = [
    { key: "hometax", name: "홈택스", desc: "국세청 사업자 홈택스 증명서류 수집", emoji: "🏛" },
    { key: "fourInsure", name: "4대보험", desc: "4대사회보험 정보연계센터 서류 수집", emoji: "🛡" },
    { key: "gov24", name: "정부24", desc: "정부24 연계 예정", emoji: "🏢" },
    { key: "wetax", name: "위택스", desc: "위택스 연계 예정", emoji: "🧾" },
];

export default function ERPSettingsPage() {
    const { data, isLoading, error } = useERPState(3000);
    const bridgeAgent = data?.bridgeAgent;
    const clients = data?.clients ?? [];

    if (isLoading && !data) {
        return <div style={{ padding: "36px 40px", color: "#64748b" }}>설정 정보를 불러오는 중...</div>;
    }

    return (
        <div style={{ padding: "36px 40px", maxWidth: 960 }}>
            {error && (
                <div style={{
                    marginBottom: 16, padding: "10px 14px", borderRadius: 10,
                    background: "#fff7ed", border: "1px solid #fdba74", color: "#9a3412",
                    fontSize: "0.82rem",
                }}>
                    상태 동기화 오류: {error}
                </div>
            )}

            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.04em" }}>관리자 설정</h1>
                <p style={{ color: "#64748b", fontSize: "0.88rem", marginTop: 4 }}>기관 연결 설정 및 에이전트 상태</p>
            </div>

            <div style={{ background: "#fff", borderRadius: 16, padding: 28, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>데스크톱 에이전트 연결 상태</h2>
                <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "16px 20px", background: "#f8fafc", borderRadius: 12,
                    border: "1px solid #e2e8f0",
                }}>
                    <div style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: bridgeAgent?.connected ? "#22c55e" : "#ef4444",
                    }} />
                    <div>
                        <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#334155" }}>
                            {bridgeAgent?.connected ? "에이전트 연결됨" : "에이전트 연결 안 됨"}
                        </p>
                        <p style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>
                            {bridgeAgent?.connected
                                ? `${bridgeAgent.url} · 실행중 작업 ${bridgeAgent.runningJobs ?? 0}건`
                                : bridgeAgent?.error ?? "브리지 에이전트를 실행해야 합니다."}
                        </p>
                    </div>
                </div>
                <div style={{ marginTop: 14, padding: "12px 16px", background: "#eff6ff", borderRadius: 10, border: "1px solid #bfdbfe" }}>
                    <p style={{ fontSize: "0.78rem", color: "#1e40af" }}>
                        ERP 웹은 `/api/erp/state`를 폴링하고, 서버는 브리지 에이전트 상태를 동기화합니다.
                    </p>
                </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 16, padding: 28, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>기관별 연결 설정</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {channels.map((channel) => (
                        <div key={channel.key} style={{
                            display: "flex", alignItems: "center", gap: 16,
                            padding: "16px 20px", border: "1px solid #e2e8f0", borderRadius: 12,
                        }}>
                            <span style={{ fontSize: "1.5rem" }}>{channel.emoji}</span>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>{channel.name}</p>
                                <p style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>{channel.desc}</p>
                            </div>
                            <span style={{
                                fontSize: "0.75rem", color: "#475569",
                                padding: "4px 10px", background: "#f8fafc", borderRadius: 99,
                            }}>
                                {channel.key === "hometax" || channel.key === "fourInsure" ? "연동됨" : "준비중"}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>등록 사업장 현황</h2>
                    <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>총 {clients.length}개</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {clients.map((client) => (
                        <div key={client.id} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "12px 16px", border: "1px solid #f1f5f9", borderRadius: 10,
                        }}>
                            <div>
                                <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#0f172a" }}>{client.name}</p>
                                <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "monospace", marginTop: 2 }}>
                                    {client.bizNo} · 담당 {client.manager}
                                </p>
                            </div>
                            <span style={{
                                padding: "4px 10px", borderRadius: 99, fontSize: "0.75rem", fontWeight: 600,
                                background: client.mandateStatus === "ACTIVE" ? "#f0fdf4" : "#f8fafc",
                                color: client.mandateStatus === "ACTIVE" ? "#16a34a" : "#94a3b8",
                            }}>
                                {client.mandateStatus}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
