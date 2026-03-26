"use client";

import { useState } from "react";

export function ContractSender() {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSend = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/kakao/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "contract_sign",
                    payload: {
                        recipientPhone: "01010001000",
                        recipientName: "홍길동",
                        contractTitle: "근로계약서 (2026년 신규 입사)",
                        signUrl: `${location.origin}/sign/sample-contract`,
                        expireDays: 7,
                    },
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSent(true);
            } else {
                setError(data.error ?? "발송 실패");
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "네트워크 오류");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #eef0f6",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            padding: 32,
            marginBottom: 32,
            display: "flex",
            gap: 40,
            flexWrap: "wrap"
        }}>

            {/* ── Left: Sending Form ── */}
            <div style={{ flex: "1 1 300px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1" }} />
                    <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.03em" }}>
                        근로계약서 전자서명 보내기
                    </h2>
                </div>

                <p style={{ fontSize: "0.95rem", color: "#6b7280", marginBottom: 28, lineHeight: 1.6, letterSpacing: "-0.01em" }}>
                    신규 입사자에게 근로계약서 내용을 확인하고 전자서명할 수 있는 안전한 링크를 <strong style={{ color: "#3730a3" }}>문자메시지(알림톡)</strong>로 전송합니다.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#4b5563", marginBottom: 8 }}>
                            대상 직원 (미리보기: 홍길동)
                        </label>
                        <input
                            type="text"
                            value="홍길동 (간호사 / 진료지원)"
                            disabled
                            style={{ width: "100%", padding: "14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontWeight: 500 }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#4b5563", marginBottom: 8 }}>
                            수신 연락처
                        </label>
                        <input
                            type="text"
                            value="010-1000-1000"
                            disabled
                            style={{ width: "100%", padding: "14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontWeight: 500 }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: 32 }}>
                    {sent ? (
                        <div style={{
                            background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 12, padding: "20px",
                            display: "flex", alignItems: "center", gap: 16, color: "#065f46", fontWeight: 700
                        }}>
                            <span style={{ fontSize: "1.5rem" }}>✅</span>
                            <div>
                                <div style={{ fontSize: "1.05rem", letterSpacing: "-0.01em" }}>전송 완료!</div>
                                <div style={{ fontSize: "0.85rem", color: "#047857", fontWeight: 500, marginTop: 4 }}>
                                    직원에게 카카오 알림톡(전자서명 연동) 발송이 성공했습니다.
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            style={{
                                width: "100%", padding: "18px", borderRadius: 12, border: "none",
                                background: loading ? "#cbd5e1" : "linear-gradient(135deg, #3730a3, #6366f1)",
                                color: "#fff", fontSize: "1.1rem", fontWeight: 800,
                                cursor: loading ? "not-allowed" : "pointer",
                                boxShadow: loading ? "none" : "0 6px 20px rgba(99,102,241,0.3)",
                                transition: "all 0.2s", letterSpacing: "-0.01em"
                            }}
                        >
                            {loading ? "Solapi 발송 연결 중..." : "✉️ 전자서명 진행하기 (알림톡 발송)"}
                        </button>
                        {error && (
                            <div style={{
                                marginTop: 12, background: "#fef2f2", border: "1px solid #fecaca",
                                borderRadius: 10, padding: "14px 16px", color: "#dc2626",
                                fontSize: "0.9rem", fontWeight: 600, lineHeight: 1.5
                            }}>
                                ⚠️ 발송 실패: {error}
                                <div style={{ color: "#991b1b", fontSize: "0.8rem", marginTop: 6, fontWeight: 500 }}>
                                    .env.local 파일에 SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_KAKAO_PF_ID를 먼저 넣어 주세요.
                                </div>
                            </div>
                        )}
                        </>
                    )}
                </div>
            </div>
            {/* ── Right: Notion-style Attachment Preview ── */}
            <div style={{
                flex: "1 1 300px",
                background: "#f8fafc",
                borderRadius: 16,
                padding: "28px 32px",
                border: "1px dashed #cbd5e1",
                display: "flex", flexDirection: "column"
            }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b", marginBottom: 10, display: "flex", alignItems: "center", gap: 10, letterSpacing: "-0.01em" }}>
                    <span>📎</span> 사업주 직접 업로드 (필수 수합 서류)
                </h3>

                <p style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: 24, lineHeight: 1.6, letterSpacing: "-0.01em" }}>
                    직원에게 오프라인이나 메신저로 받은 <strong>주민등록등본 등 필수 확인 서류</strong>를 이곳에 직접 올려주세요. 신분 확인 및 4대보험 가입 등 노무사/세무사가 확인합니다.
                </p>

                {/* File item 1: Resident Registration */}
                <div style={{
                    background: "#fff",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                    padding: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 14,
                    cursor: "pointer",
                    transition: "transform 0.15s, box-shadow 0.15s"
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.06)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.03)";
                    }}
                >
                    {/* Notion style image thumbnail */}
                    <div style={{
                        width: 64, height: 64,
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "1px solid #e2e8f0",
                        flexShrink: 0,
                        background: "#f1f5f9",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <img
                            src="/dummy_doc.png"
                            alt="주민등록등본 썸네일"
                            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.95 }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>주민등록등본.pdf</div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 4, fontWeight: 500 }}>최근 수정: 오늘 오후 1:30</div>
                    </div>
                    <div style={{ color: "#a5b4fc", fontWeight: 700, fontSize: "0.85rem", padding: "6px 12px", background: "#eef2ff", borderRadius: 6 }}>
                        등록됨
                    </div>
                </div>

                {/* File item 2: Bank Copy - UPLOAD BUTTON */}
                <div style={{
                    background: "#f1f5f9",
                    borderRadius: 10,
                    border: "1px dashed #94a3b8",
                    padding: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    cursor: "pointer",
                    transition: "background 0.15s"
                }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#e2e8f0"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#f1f5f9"}
                >
                    <div style={{
                        width: 64, height: 64,
                        borderRadius: 8,
                        border: "1px dashed #94a3b8",
                        flexShrink: 0,
                        background: "#fff",
                        color: "#64748b",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 24
                    }}>
                        +
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "1rem", fontWeight: 800, color: "#334155", letterSpacing: "-0.02em" }}>급여통장사본 추가</div>
                        <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: 4, fontWeight: 500 }}>클릭하여 이지미/PDF 업로드</div>
                    </div>
                </div>

                <div style={{ marginTop: "auto", paddingTop: 24 }}>
                    <p style={{ fontSize: "0.85rem", color: "#94a3b8", textAlign: "center", lineHeight: 1.6, fontWeight: 500 }}>
                        직원 정보 보호를 위해 업로드된 서류는<br />노무사/세무사 및 사업주만 열람할 수 있습니다.
                    </p>
                </div>
            </div>

        </div>
    );
}
