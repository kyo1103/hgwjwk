import Link from "next/link";
import {
  blueprintSurfaces,
  deliveryPhases,
  trustControls,
  workspaceCards,
} from "@/lib/platform-blueprint";

export default function AppHomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)",
        padding: "44px 0 72px",
      }}
    >
      <div
        style={{
          width: "min(1240px, calc(100% - 48px))",
          margin: "0 auto",
        }}
      >
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 18,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 24,
              border: "1px solid rgba(148, 163, 184, 0.18)",
              padding: "28px 28px 26px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "8px 12px",
                borderRadius: 999,
                background: "#dcfce7",
                color: "#166534",
                fontSize: "0.74rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              Internal Operations
            </div>
            <h1
              style={{
                fontSize: "clamp(2rem, 4vw, 3.1rem)",
                fontWeight: 800,
                letterSpacing: "-0.06em",
                color: "#020617",
                lineHeight: 1.05,
                marginBottom: 14,
              }}
            >
              운영 콘솔은
              <br />
              업무 우선순위를 먼저 보여줘야 합니다.
            </h1>
            <p
              style={{
                color: "#475569",
                fontSize: "1rem",
                lineHeight: 1.8,
                maxWidth: 640,
                marginBottom: 20,
              }}
            >
              현재 워크스페이스는 자문 운영, 고객 포털, 자동화 ERP로 나뉘어
              있습니다. 내부 운영 허브에서는 요청과 고객사, 로그와 ERP 상태를
              같은 운영 시선으로 연결해 주는 것이 핵심입니다.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/app/inbox" className="btn">
                인박스 보기
              </Link>
              <Link href="/erp" className="btn outline">
                ERP 현황 확인
              </Link>
            </div>
          </div>

          <div
            style={{
              background: "#0f172a",
              color: "#e2e8f0",
              borderRadius: 24,
              padding: "28px 24px",
            }}
          >
            <p
              style={{
                fontSize: "0.74rem",
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#7dd3fc",
                marginBottom: 14,
              }}
            >
              Current Surfaces
            </p>
            <div style={{ display: "grid", gap: 12 }}>
              {blueprintSurfaces.map((surface) => (
                <Link
                  key={surface.code}
                  href={surface.href}
                  style={{
                    display: "block",
                    padding: "16px 16px 15px",
                    borderRadius: 18,
                    border: "1px solid rgba(148, 163, 184, 0.18)",
                    background: "rgba(15, 23, 42, 0.28)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.74rem",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#7dd3fc",
                      }}
                    >
                      {surface.code}
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                      바로가기
                    </span>
                  </div>
                  <h2
                    style={{
                      color: "#f8fafc",
                      fontSize: "1rem",
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    {surface.title}
                  </h2>
                  <p style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: 1.7 }}>
                    {surface.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {workspaceCards.map((card) => (
            <Link
              key={card.code}
              href={card.href}
              style={{
                background: "#ffffff",
                borderRadius: 22,
                border: "1px solid rgba(148, 163, 184, 0.18)",
                padding: "22px 20px",
                display: "block",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 82,
                  padding: "7px 12px",
                  borderRadius: 999,
                  background: `${card.accent}12`,
                  color: card.accent,
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 14,
                }}
              >
                {card.code}
              </div>
              <h2
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "#020617",
                  marginBottom: 8,
                }}
              >
                {card.title}
              </h2>
              <p style={{ color: "#475569", lineHeight: 1.72 }}>{card.description}</p>
            </Link>
          ))}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 18,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 24,
              border: "1px solid rgba(148, 163, 184, 0.18)",
              padding: "24px 22px",
            }}
          >
            <p
              style={{
                fontSize: "0.74rem",
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#0369a1",
                marginBottom: 14,
              }}
            >
              Trust Checklist
            </p>
            <div style={{ display: "grid", gap: 12 }}>
              {trustControls.map((item) => (
                <div
                  key={item.title}
                  style={{
                    padding: "14px 14px 13px",
                    borderRadius: 18,
                    background: "#f8fafc",
                    border: "1px solid rgba(148, 163, 184, 0.15)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: 5,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "0.88rem", lineHeight: 1.7 }}>
                    {item.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: 24,
              border: "1px solid rgba(148, 163, 184, 0.18)",
              padding: "24px 22px",
            }}
          >
            <p
              style={{
                fontSize: "0.74rem",
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#0369a1",
                marginBottom: 14,
              }}
            >
              Delivery Sequence
            </p>
            <div style={{ display: "grid", gap: 12 }}>
              {deliveryPhases.slice(0, 4).map((item) => (
                <div
                  key={item.phase}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "92px 1fr",
                    gap: 12,
                    alignItems: "start",
                    paddingBottom: 12,
                    borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.76rem",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#0f172a",
                      }}
                    >
                      {item.phase}
                    </div>
                    <div style={{ color: "#64748b", fontSize: "0.82rem", marginTop: 4 }}>
                      {item.period}
                    </div>
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: "#0f172a",
                        marginBottom: 5,
                      }}
                    >
                      {item.title}
                    </h3>
                    <p style={{ color: "#64748b", fontSize: "0.88rem", lineHeight: 1.7 }}>
                      {item.outcome}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
