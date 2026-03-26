"use client";

import { useRouter } from "next/navigation";

type Props = { tenantSlug: string };

const EVENTS = [
    {
        id: "regular",
        icon: "👨‍💼",
        title: "정규직 채용",
        desc: "기간의 정함이 없는 상용 근로계약 (수습 포함).",
        params: { firstHire: "false", employeeType: "regular", over10: "true", businessRegistered: "true" } // Assuming pre-configured for demo
    },
    {
        id: "daily",
        icon: "👷",
        title: "단기·일용직 채용",
        desc: "1개월 미만 고용 또는 일당제 근로자.",
        params: { firstHire: "false", employeeType: "daily", over10: "true", businessRegistered: "true" }
    },
    {
        id: "resignation",
        icon: "👋",
        title: "직원 퇴사 발생",
        desc: "기존 직원이 퇴사하여 4대보험 상실신고 필요.",
        params: { firstHire: "false", employeeType: "resign", over10: "true", businessRegistered: "true" }
    }
];

export function EventSelector({ tenantSlug }: Props) {
    const router = useRouter();

    const handleSelect = (paramsObj: Record<string, string>) => {
        const params = new URLSearchParams(paramsObj);
        router.push(`/portal/${tenantSlug}/onboarding/checklist?${params.toString()}`);
    };

    return (
        <div style={{ padding: "40px 0", maxWidth: 900, margin: "0 auto" }}>

            <div style={{ textAlign: "center", marginBottom: 48 }}>
                <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#1e293b", margin: "0 0 16px", letterSpacing: "-0.04em" }}>
                    어떤 이벤트가 발생했나요?
                </h2>
                <p style={{ fontSize: "1.05rem", color: "#64748b", margin: 0, lineHeight: 1.6 }}>
                    긴 문답은 생략합니다. 원장님 사업장의 맞춤 설정은 이미 담당 노무사/세무사님이 마쳤습니다.<br />
                    아래에서 <strong>발생한 상황 버튼을 하나만 누르시면</strong> 바로 필요 서류가 정리됩니다.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
                {EVENTS.map(event => (
                    <button
                        key={event.id}
                        onClick={() => handleSelect(event.params)}
                        style={{
                            background: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: 20,
                            padding: "40px 32px",
                            textAlign: "center",
                            cursor: "pointer",
                            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 16
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = "translateY(-4px)";
                            e.currentTarget.style.boxShadow = "0 12px 32px rgba(99,102,241,0.12)";
                            e.currentTarget.style.borderColor = "#818cf8";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.03)";
                            e.currentTarget.style.borderColor = "#e2e8f0";
                        }}
                    >
                        <div style={{
                            width: 72, height: 72, background: "#eef2ff", borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "2.4rem", marginBottom: 8, flexShrink: 0
                        }}>
                            {event.icon}
                        </div>

                        <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.03em" }}>
                            {event.title}
                        </h3>

                        <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                            {event.desc}
                        </p>
                    </button>
                ))}
            </div>

        </div>
    );
}
