"use client";

import type { AuditActionType } from "@/lib/erp-types";
import { useERPState } from "@/lib/use-erp-state";

const actionTypeConfig: Record<AuditActionType, { label: string; bg: string; color: string }> = {
    JOB_REQUESTED: { label: "작업요청", bg: "#eff6ff", color: "#1d4ed8" },
    JOB_STARTED: { label: "작업시작", bg: "#f0fdf4", color: "#15803d" },
    JOB_SUCCESS: { label: "수집완료", bg: "#f0fdf4", color: "#15803d" },
    JOB_FAILED: { label: "수집실패", bg: "#fff1f2", color: "#dc2626" },
    JOB_RETRIED: { label: "재시도", bg: "#fff7ed", color: "#c2410c" },
    DOCUMENT_SAVED: { label: "문서저장", bg: "#faf5ff", color: "#7c3aed" },
    LOGIN_SUCCESS: { label: "로그인성공", bg: "#f0fdf4", color: "#15803d" },
    LOGIN_FAILED: { label: "로그인실패", bg: "#fff1f2", color: "#dc2626" },
    SETTING_CHANGED: { label: "설정변경", bg: "#f8fafc", color: "#475569" },
};

export default function AuditLogsPage() {
    const { data, isLoading, error } = useERPState(3000);
    const logs = data?.auditLogs ?? [];

    if (isLoading && !data) {
        return <div style={{ padding: "36px 40px", color: "#64748b" }}>감사로그를 불러오는 중...</div>;
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
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.04em" }}>감사로그</h1>
                <p style={{ color: "#64748b", fontSize: "0.88rem", marginTop: 4 }}>모든 작업 실행 이력과 문서 저장 기록</p>
            </div>

            <div style={{
                padding: "10px 16px", background: "#fff7ed",
                borderRadius: 10, border: "1px solid #fed7aa",
                marginBottom: 20, fontSize: "0.82rem", color: "#9a3412",
            }}>
                감사로그는 읽기 전용이며 실시간 폴링으로 최신 상태를 반영합니다.
            </div>

            <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                            {["일시", "액션", "실행자", "사업장", "상세 내용", "로그 ID"].map((header) => (
                                <th key={header} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", whiteSpace: "nowrap" }}>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log, index) => {
                            const config = actionTypeConfig[log.actionType];
                            return (
                                <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9", background: index % 2 === 0 ? "#fff" : "#fafafa" }}>
                                    <td style={{ padding: "11px 16px", fontSize: "0.78rem", color: "#64748b", whiteSpace: "nowrap" }}>
                                        {new Date(log.createdAt).toLocaleString("ko-KR", {
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                        })}
                                    </td>
                                    <td style={{ padding: "11px 16px" }}>
                                        <span style={{
                                            display: "inline-block", padding: "3px 8px", borderRadius: 99,
                                            background: config.bg, color: config.color,
                                            fontSize: "0.72rem", fontWeight: 700,
                                        }}>
                                            {config.label}
                                        </span>
                                    </td>
                                    <td style={{ padding: "11px 16px", fontSize: "0.82rem", color: "#374151", fontWeight: 500 }}>
                                        {log.actorName}
                                    </td>
                                    <td style={{ padding: "11px 16px", fontSize: "0.82rem", color: "#374151" }}>
                                        {log.clientName ?? "-"}
                                    </td>
                                    <td style={{ padding: "11px 16px", fontSize: "0.82rem", color: "#374151", maxWidth: 320 }}>
                                        {log.detail}
                                    </td>
                                    <td style={{ padding: "11px 16px", fontFamily: "monospace", fontSize: "0.68rem", color: "#94a3b8" }}>
                                        {log.id}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
