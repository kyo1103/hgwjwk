import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/data";
import { PortalShell } from "@/components/PortalShell";
import { DocumentCard } from "@/components/DocumentCard";
import { ExpertChatPanel } from "@/components/ExpertChatPanel";
import Link from "next/link";

function deadline(daysFromNow: number) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().slice(0, 10);
}

function nextMonth15() {
    const d = new Date();
    d.setMonth(d.getMonth() + 1, 15);
    return d.toISOString().slice(0, 10);
}

function nextMonthEnd() {
    const d = new Date();
    d.setMonth(d.getMonth() + 2, 0);
    return d.toISOString().slice(0, 10);
}

type SearchParams = { [k: string]: string | undefined };

export default async function OnboardingChecklistPage({
    params,
    searchParams,
}: {
    params: { tenantSlug: string };
    searchParams: SearchParams;
}) {
    const tenant = getTenantBySlug(params.tenantSlug);
    if (!tenant) return notFound();

    const firstHire = searchParams.firstHire === "true";
    const isDaily = searchParams.employeeType === "daily";
    const isResign = searchParams.employeeType === "resign";
    const over10 = searchParams.over10 === "true";

    // Example dummy logic for title
    let eventName = "정규직 채용";
    if (isDaily) eventName = "단기·일용직 채용";
    if (isResign) eventName = "직원 중도 퇴사";

    return (
        <PortalShell tenant={tenant} active="onboarding">
            <div style={{ padding: "0 0 60px", display: "flex", gap: 32, height: "calc(100vh - 120px)" }}>

                {/* ── 🟡 Left: Dynamic Checklist ── */}
                <div style={{ flex: "1 1 auto", overflowY: "auto", paddingRight: 16, scrollbarWidth: "thin" }}>

                    <div style={{ marginBottom: 40 }}>
                        <Link
                            href={`/portal/${params.tenantSlug}/onboarding`}
                            style={{ fontSize: "0.85rem", color: "#6366f1", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16 }}
                        >
                            ← 이벤트 다시 선택
                        </Link>

                        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.04em" }}>
                            {eventName} 체크리스트
                        </h1>
                        <p style={{ fontSize: "0.95rem", color: "#64748b", margin: 0 }}>
                            사전 설정: {over10 ? "10인 이상" : "10인 미만"} &middot; 기존 4대보험 가입 사업장
                        </p>
                    </div>

                    {/* If Resignation */}
                    {isResign && (
                        <Section title="👋 직원 퇴사 신고" subtitle="퇴사 직원의 4대보험 상실신고 및 퇴직금 정산입니다.">
                            <DocumentCard
                                title="[4대보험] 사업장가입자 자격상실신고"
                                description="4대보험 정보연계센터에서 공통 서식으로 상실신고."
                                deadline={nextMonth15()}
                                govLink="https://www.4insure.or.kr"
                                govLabel="4대보험 연계센터"
                                mandatory
                            />
                            <DocumentCard
                                title="퇴직금 정산 및 지급명세서 제출"
                                description="퇴직금은 퇴사일로부터 14일 이내 지급."
                                deadline={deadline(14)}
                                govLink="https://www.hometax.go.kr"
                                govLabel="홈택스"
                                mandatory
                            />
                        </Section>
                    )}

                    {/* Common Hire Documents - Exclude if resign */}
                    {!isResign && (
                        <Section title="📄 공통 필수 서류" subtitle="모든 채용에 해당합니다.">
                            <DocumentCard
                                title="근로계약서"
                                description="법정 필수 서면 교부 의무. 임금·근로시간·휴일·연차·사회보험 등 포함."
                                deadline={deadline(3)}
                                govLink={`/portal/${params.tenantSlug}/contracts`}
                                govLabel="근로계약서 모듈 바로가기"
                                mandatory
                            />
                            <DocumentCard
                                title="입사자 기본정보 입력"
                                description="입사일, 직무, 급여조건, 연락처, 급여계좌번호 등 사내 ERP 등록."
                                deadline={deadline(1)}
                                govLink={`/portal/${params.tenantSlug}/people`}
                                govLabel="직원명부 바로가기"
                                mandatory
                            />
                        </Section>
                    )}

                    {/* Regular Hire Acquisition */}
                    {!isResign && !isDaily && (
                        <Section title="📬 직원별 자격취득신고 (상용직)" subtitle="기존 사업장에 추가 채용 시, 기관별 마감일이 다릅니다.">
                            <DocumentCard
                                title="[국민연금] 사업장가입자 자격취득신고"
                                description="4대보험 정보연계센터에서 공통 서식으로 한 번에 신고 가능."
                                deadline={nextMonth15()}
                                govLink="https://www.4insure.or.kr"
                                govLabel="4대보험 정보연계센터"
                                mandatory
                            />
                            <DocumentCard
                                title="[건강보험] 직장가입자 자격취득신고"
                                description="적용일로부터 14일 이내. 피부양자 추가 시 가족관계증명서 첨부."
                                deadline={deadline(14)}
                                govLink="https://www.4insure.or.kr"
                                govLabel="4대보험 정보연계센터"
                                mandatory
                            />
                            <DocumentCard
                                title="[고용보험] 피보험자격 취득신고"
                                description="사유 발생일이 속하는 달의 다음 달 15일까지."
                                deadline={nextMonth15()}
                                govLink="https://www.work24.go.kr"
                                govLabel="고용24"
                                mandatory
                            />
                        </Section>
                    )}

                    {/* Daily Hire Flow */}
                    {!isResign && isDaily && (
                        <Section title="🔄 일용직 신고 흐름" subtitle="일용직은 월 단위로 근로내용확인신고서를 제출합니다.">
                            <DocumentCard
                                title="[고용보험] 근로내용확인신고서"
                                description="해당 월 근로일수·보수 등 기재. 다음 달 15일까지 신고 시 취득·상실 신고로 인정."
                                deadline={nextMonth15()}
                                govLink="https://www.work24.go.kr"
                                govLabel="고용24"
                                mandatory
                            />
                            <DocumentCard
                                title="일용근로소득 지급명세서 (세무)"
                                description="지급일이 속하는 달의 다음 달 말일까지 홈택스에 제출."
                                deadline={nextMonthEnd()}
                                govLink="https://www.hometax.go.kr"
                                govLabel="홈택스"
                                mandatory
                            />
                        </Section>
                    )}

                    {/* 10+ Employees Rule */}
                    {!isResign && over10 && (
                        <Section title="📑 취업규칙 안내 (10인 이상)" subtitle="10인 이상 사업장은 취업규칙 작성·신고 의무가 있습니다.">
                            <DocumentCard
                                title="표준취업규칙 업데이트"
                                description="노무 법령 변경 시 취업규칙 업데이트 필요 여부 점검."
                                deadline={deadline(30)}
                                govLink="https://www.moel.go.kr"
                                govLabel="고용노동부"
                                mandatory={false}
                            />
                        </Section>
                    )}

                </div>

                {/* ── 🟢 Right: Expert Q&A Chat ── */}
                <div style={{ flex: "0 0 380px", minWidth: 0 }}>
                    <ExpertChatPanel />
                </div>

            </div>
        </PortalShell>
    );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 48 }}>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1e293b", margin: "0 0 4px", letterSpacing: "-0.02em" }}>{title}</h2>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>{subtitle}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {children}
            </div>
        </div>
    );
}
