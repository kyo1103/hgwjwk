"use client";

import { useState } from "react";

type MessageType = "custom" | "contract_sign" | "leave_promotion" | "payslip_ready";

const TEMPLATES: Record<MessageType, { label: string; defaultBody: object }> = {
  custom: {
    label: "✏️ 직접 입력",
    defaultBody: { type: "custom", phone: "", text: "노무법인 ERP 테스트 메시지입니다." },
  },
  contract_sign: {
    label: "📋 근로계약서 서명 요청",
    defaultBody: {
      type: "contract_sign",
      params: {
        phone: "",
        employeeName: "홍길동",
        contractTitle: "2026년 근로계약서",
        signUrl: "https://example.com/sign/1",
        expireDays: 7,
      },
    },
  },
  leave_promotion: {
    label: "🏖️ 연차촉진 안내",
    defaultBody: {
      type: "leave_promotion",
      params: {
        phone: "",
        employeeName: "홍길동",
        remainingDays: 5,
        deadline: "2026년 12월 31일",
        portalUrl: "https://example.com/leave",
      },
    },
  },
  payslip_ready: {
    label: "💰 급여명세서 발행",
    defaultBody: {
      type: "payslip_ready",
      params: {
        phone: "",
        employeeName: "홍길동",
        year: 2026,
        month: 3,
        netPay: "3,200,000",
        portalUrl: "https://example.com/payslip",
      },
    },
  },
};

export function MessageSendTester() {
  const [msgType, setMsgType] = useState<MessageType>("custom");
  const [phone, setPhone] = useState("");
  const [customText, setCustomText] = useState("노무법인 ERP 테스트 메시지입니다.");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSend = async () => {
    if (!phone.trim()) {
      setResult({ success: false, message: "전화번호를 입력해 주세요." });
      return;
    }

    setLoading(true);
    setResult(null);

    // 선택된 템플릿 기반으로 payload 구성
    const template = TEMPLATES[msgType];
    let payload = JSON.parse(JSON.stringify(template.defaultBody));

    // phone 주입
    if (msgType === "custom") {
      payload.phone = phone;
      payload.text = customText;
    } else {
      payload.params.phone = phone;
    }

    try {
      const res = await fetch("/api/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ success: true, message: "발송 성공! messageId: " + (data.messageId ?? "배치처리") });
      } else {
        setResult({ success: false, message: "발송 실패: " + (data.error ?? "알 수 없는 오류") });
      }
    } catch (e) {
      setResult({ success: false, message: "네트워크 오류: " + (e instanceof Error ? e.message : String(e)) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 20,
      padding: 32,
      maxWidth: 640,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <span style={{ fontSize: "1.4rem" }}>📱</span>
        <h2 style={{ fontWeight: 900, fontSize: "1.3rem", color: "#111827", margin: 0, letterSpacing: "-0.03em" }}>
          메시지 발송 테스트
        </h2>
      </div>

      {/* 메시지 타입 선택 */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: 8 }}>
          발송 유형
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {(Object.keys(TEMPLATES) as MessageType[]).map((key) => (
            <button
              key={key}
              onClick={() => setMsgType(key)}
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                border: msgType === key ? "2px solid #3730a3" : "1px solid #e2e8f0",
                background: msgType === key ? "#eef2ff" : "#f8fafc",
                color: msgType === key ? "#3730a3" : "#374151",
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              {TEMPLATES[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* 수신 번호 입력 */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: 8 }}>
          수신 전화번호
        </label>
        <input
          type="tel"
          placeholder="010-1234-5678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            width: "100%", padding: "13px 16px", borderRadius: 10,
            border: "1px solid #d1d5db", fontSize: "1rem", color: "#111827",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* 직접 입력 텍스트 */}
      {msgType === "custom" && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: 8 }}>
            메시지 내용
          </label>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={4}
            style={{
              width: "100%", padding: "13px 16px", borderRadius: 10,
              border: "1px solid #d1d5db", fontSize: "0.9rem", color: "#111827",
              resize: "vertical", boxSizing: "border-box", lineHeight: 1.6,
            }}
          />
        </div>
      )}

      {/* 결과 */}
      {result && (
        <div style={{
          marginBottom: 16,
          padding: "14px 18px",
          borderRadius: 10,
          background: result.success ? "#ecfdf5" : "#fef2f2",
          border: `1px solid ${result.success ? "#a7f3d0" : "#fecaca"}`,
          color: result.success ? "#065f46" : "#dc2626",
          fontSize: "0.9rem",
          fontWeight: 600,
        }}>
          {result.success ? "✅ " : "⚠️ "}{result.message}
          {!result.success && (
            <div style={{ fontSize: "0.8rem", marginTop: 6, fontWeight: 400, opacity: 0.85 }}>
              .env.local 에 SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER_NUMBER 를 설정했는지 확인해 주세요.
            </div>
          )}
        </div>
      )}

      {/* 발송 버튼 */}
      <button
        onClick={handleSend}
        disabled={loading}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: 12,
          border: "none",
          background: loading ? "#94a3b8" : "linear-gradient(135deg, #3730a3, #6366f1)",
          color: "#fff",
          fontSize: "1rem",
          fontWeight: 800,
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: loading ? "none" : "0 4px 14px rgba(99,102,241,0.35)",
          transition: "all 0.2s",
          letterSpacing: "-0.01em",
        }}
      >
        {loading ? "Solapi 발송 중..." : "📤 메시지 발송"}
      </button>
    </div>
  );
}
