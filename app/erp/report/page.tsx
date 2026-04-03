"use client";

export default function ReportPage() {
  return (
    <div style={{ padding: "28px 32px", maxWidth: 1800, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 4 }}>
          보고서
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.88rem" }}>
          각종 세무/노무 보고서를 조회하는 페이지입니다. (준비 중)
        </p>
      </div>
      
      <div style={{ 
        background: "#f1f5f9", 
        border: "1px dashed #cbd5e1", 
        borderRadius: 14, 
        padding: 40, 
        textAlign: "center",
        color: "#64748b"
      }}>
        보고서 화면 영역입니다.
      </div>
    </div>
  );
}
