import { notFound } from "next/navigation";
import { getTenantBySlug, getLaborIssues, getEmployee } from "@/lib/data";
import { PortalShell } from "@/components/PortalShell";
import Link from "next/link";
import { LaborIssue } from "@/lib/types";
import styles from "./Issues.module.css";

function SeverityBadge({ level }: { level: LaborIssue["severity"] }) {
    if (level === "high") {
        return <span className={`${styles.badge} ${styles.severityHigh}`}>중대 리스크</span>;
    }
    if (level === "medium") {
        return <span className={`${styles.badge} ${styles.severityMedium}`}>관찰 요망</span>;
    }
    return <span className={`${styles.badge} ${styles.severityLow}`}>일반 기록</span>;
}

function StatusBadge({ status }: { status: LaborIssue["status"] }) {
    if (status === "investigating") {
        return <span className={`${styles.badge} ${styles.statusInvestigating}`}>조사/대응중</span>;
    }
    if (status === "resolved") {
        return <span className={`${styles.badge} ${styles.statusResolved}`}>처리완료</span>;
    }
    return <span className={`${styles.badge} ${styles.statusOpen}`}>발생/대기</span>;
}

function categoryLabel(cat: string) {
    const map: Record<string, string> = {
        absenteeism: "근태/결근",
        harassment: "직장내 괴롭힘",
        discipline: "징계사유",
        performance: "근무태만/저성과",
        other: "기타"
    };
    return map[cat] || cat;
}

export default async function LaborIssuesPage({
    params,
}: {
    params: { tenantSlug: string };
}) {
    const tenant = getTenantBySlug(params.tenantSlug);
    if (!tenant) return notFound();

    const issues = getLaborIssues(tenant.id);

    // Sort by highest severity and newest
    const sortedIssues = [...issues].sort((a, b) => {
        if (a.status === "open" && b.status !== "open") return -1;
        if (a.severity === "high" && b.severity !== "high") return -1;
        return new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime();
    });

    const activeCount = issues.filter(i => i.status !== "resolved").length;
    const highCount = issues.filter(i => i.severity === "high").length;
    const resolvedCount = issues.filter(i => i.status === "resolved").length;

    return (
        <PortalShell tenant={tenant} active="issues">
            <div className={styles.pageContainer}>

                {/* Header Section */}
                <div className={styles.headerArea}>
                    <div>
                        <div className={styles.titleWrapper}>
                            <span className={styles.titleIcon}>🛡️</span>
                            <h1 className={styles.titleText}>인사·노무 리스크 관리</h1>
                        </div>
                        <p className={styles.headerDesc}>
                            잠재적 위험을 조기에 발견하고, 담당 노무사와 함께 전문적이고 체계적으로 관리합니다.
                        </p>
                    </div>
                    <button className={styles.newBtn}>
                        <span className={styles.newBtnIcon}>✨</span>
                        신규 이슈 등록
                    </button>
                </div>

                {/* Dashboard Stats */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div>
                            <div className={styles.statLabel}>모니터링 대상</div>
                            <div className={styles.statValue}>
                                {activeCount}
                                <span className={styles.statUnit}>건</span>
                            </div>
                        </div>
                        <div className={`${styles.statIconWrap} ${styles.normal}`}>👀</div>
                    </div>
                    
                    <div className={`${styles.statCard} ${styles.high}`}>
                        <div>
                            <div className={`${styles.statLabel} ${styles.high}`}>집중 관리 (중대 위험)</div>
                            <div className={`${styles.statValue} ${styles.high}`}>
                                {highCount}
                                <span className={`${styles.statUnit} ${styles.high}`}>건</span>
                            </div>
                        </div>
                        <div className={`${styles.statIconWrap} ${styles.high}`}>🚨</div>
                    </div>

                    <div className={`${styles.statCard} ${styles.resolved}`}>
                        <div>
                            <div className={`${styles.statLabel} ${styles.resolved}`}>안전 종결</div>
                            <div className={`${styles.statValue} ${styles.resolved}`}>
                                {resolvedCount}
                                <span className={`${styles.statUnit} ${styles.resolved}`}>건</span>
                            </div>
                        </div>
                        <div className={`${styles.statIconWrap} ${styles.resolved}`}>🛡️</div>
                    </div>
                </div>

                {/* Issue Cards */}
                <div className={styles.issueList}>
                    {sortedIssues.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>✨</div>
                            <div className={styles.emptyText}>현재 진행 중인 노무 리스크가 없습니다. 평온한 근무 환경이 유지되고 있습니다.</div>
                        </div>
                    ) : (
                        sortedIssues.map((issue) => {
                            const emp = getEmployee(tenant.id, issue.employee_id);
                            return (
                                <div key={issue.id} className={`${styles.issueCard} ${issue.severity === "high" ? styles.highSeverity : ""}`}>

                                    {/* Left: Meta */}
                                    <div className={styles.metaSection}>
                                        <SeverityBadge level={issue.severity} />
                                        
                                        <div className={styles.metaBlock}>
                                            <div className={styles.metaLabel}>관련 대상자</div>
                                            <Link href={`/portal/${tenant.slug}/people/${emp?.id}`} className={styles.empName}>
                                                {emp?.full_name || "미상"} {emp?.job_title}
                                            </Link>
                                        </div>
                                        
                                        <div className={styles.metaBlock}>
                                            <div className={styles.metaLabel}>최초 식별일</div>
                                            <div className={styles.metaValue}>{issue.reported_at.slice(0, 10)}</div>
                                        </div>
                                    </div>

                                    {/* Middle: Content */}
                                    <div className={styles.contentSection}>
                                        <div className={styles.cardHeader}>
                                            <span className={styles.categoryTag}>{categoryLabel(issue.category)}</span>
                                            <h3 className={styles.issueTitle}>{issue.title}</h3>
                                        </div>
                                        
                                        <p className={styles.issueDesc}>{issue.description}</p>
                                        
                                        <div className={styles.statusRow}>
                                            <StatusBadge status={issue.status} />
                                            {issue.status !== 'resolved' && (
                                                <div className={styles.reviewerNote}>
                                                    담당 노무사 검토 및 의견 대기 중
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className={styles.actionSection}>
                                        <button className={`${styles.cardBtn} ${styles.btnSecondary}`}>상세 이력 보기</button>
                                        {issue.severity === 'high' && issue.status !== 'resolved' ? (
                                            <button className={`${styles.cardBtn} ${styles.btnWarning}`}>신속 경위서 요청</button>
                                        ) : null}
                                        <button className={`${styles.cardBtn} ${styles.btnPrimaryOutline}`}>담당 노무사 톡</button>
                                    </div>

                                </div>
                            );
                        })
                    )}
                </div>

            </div>
        </PortalShell>
    );
}
