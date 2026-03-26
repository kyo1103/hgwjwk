import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { PortalShell } from "@/components/PortalShell";
import { getPortalContext } from "@/lib/portal-context";
import { getTenantBySlug, documents, serviceRequests, qnas } from "@/lib/data";
import { portalStore } from "@/lib/server/portal-store";
import { DashboardCharts } from "@/components/portal/DashboardCharts";

export default async function DashboardPage({ params }: { params: { tenantSlug: string } }) {
  const tenant = getTenantBySlug(params.tenantSlug);
  if (!tenant) return notFound();

  const context = getPortalContext(tenant);

  // 실시간 데이터
  const employees = portalStore.getEmployees(params.tenantSlug);
  const taxFiles = portalStore.getTaxFiles(params.tenantSlug);
  const certHistory = portalStore.getCertHistory(params.tenantSlug);
  const consultingProjects = portalStore.getConsultingProjects(params.tenantSlug);
  const qnaItems = portalStore.getQnaItems(params.tenantSlug);
  const taxPayments = portalStore.getTaxPayments(params.tenantSlug);

  // 기존 데이터
  const tenantRequests = serviceRequests.filter((r) => r.tenant_id === tenant.id && r.status !== "done");
  const tenantPayrollDocs = documents.filter((d) => d.tenant_id === tenant.id && d.category === "payroll");
  const tenantQna = qnas.filter((q) => q.tenant_id === tenant.id);

  const statCards = [
    { label: "재직 인원", value: `${employees.filter(e => e.status === "active").length}명`, hint: "사원 등록 기준", href: "payroll" },
    { label: "업로드 파일", value: `${taxFiles.length}건`, hint: `검토 대기 ${taxFiles.filter(f => f.reviewStatus === "pending").length}건`, href: "tax" },
    { label: "특별 컨설팅", value: `${consultingProjects.length}건`, hint: `진행 중 ${consultingProjects.filter(p => p.status !== "completed").length}건`, href: "consulting" },
    { label: "Q&A 대기", value: `${qnaItems.filter(q => q.status === "답변대기").length}건`, hint: "미답변 질문", href: "qna" },
  ];

  return (
    <PortalShell tenant={tenant} active="dashboard">
      <div className="page-header">
        <div>
          <span className="label">Management Overview</span>
          <h1>대표와 실무자가 바로 써먹는 운영 대시보드</h1>
          <p className="sub">급여, 세금, 민원증명, 컨설팅을 탭별로 나누되 핵심 현황은 한 화면에 모았습니다.</p>
        </div>
        <div className="toolbar">
          <Link href={`/portal/${tenant.slug}/company`} className="btn">업체정보 정리</Link>
          <Link href={`/portal/${tenant.slug}/tax`} className="btn outline">세금 자료 확인</Link>
        </div>
      </div>

      {/* 실시간 KPI */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {statCards.map((card) => (
          <Link key={card.label} href={`/portal/${tenant.slug}/${card.href}`} style={{ textDecoration: "none" }}>
            <div className="stat-card" style={{ cursor: "pointer" }}>
              <div className="num">{card.value}</div>
              <div>
                <div className="lbl" style={{ color: "var(--text-1)", fontWeight: 700 }}>{card.label}</div>
                <div className="text-sm muted">{card.hint}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 경영 차트 */}
      <div style={{ marginBottom: 24 }}>
        <DashboardCharts tenantSlug={params.tenantSlug} />
      </div>

      {/* 권한 요약 + 최근 소통 */}
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <section className="panel">
          <div className="panel-header">
            <h2>현재 열람 권한 요약</h2>
            <Badge>{context.viewerRoleLabel}</Badge>
          </div>
          <div className="panel-body" style={{ display: "grid", gap: 10 }}>
            {[
              {
                label: "민감정보 접근",
                text: context.access.canViewSensitiveOwnerDocs
                  ? "대표자 신분증, 홈택스 ID, 인증서 정보가 표시됩니다."
                  : "대표자 신분증, 홈택스 ID, 인증서 정보는 비노출 처리됩니다.",
                ok: context.access.canViewSensitiveOwnerDocs,
              },
              {
                label: "청구·계약 섹션",
                text: context.access.canViewBilling
                  ? "수임료, 조정료, 계약서 현황을 열람할 수 있습니다."
                  : "계약 기본 상태만 보이고 금액 세부내역은 숨겨집니다.",
                ok: context.access.canViewBilling,
              },
              {
                label: "민원증명 발급",
                text: context.access.canIssueCertificates
                  ? "홈택스·위택스·4대보험 증명서를 바로 발급할 수 있습니다."
                  : "민원증명 발급은 대표 또는 전문가 권한에서만 가능합니다.",
                ok: context.access.canIssueCertificates,
              },
              {
                label: "특별 컨설팅",
                text: context.access.canManageConsulting
                  ? "컨설팅 프로젝트 생성·수정·삭제가 가능합니다."
                  : "컨설팅 세부 자료는 대표·전문가 권한에서 관리합니다.",
                ok: context.access.canManageConsulting,
              },
            ].map((item) => (
              <div key={item.label} className="card" style={{ padding: "12px 16px", borderLeft: `4px solid ${item.ok ? "var(--green)" : "var(--amber)"}` }}>
                <strong style={{ display: "block", marginBottom: 4, fontSize: "0.88rem" }}>{item.label}</strong>
                <p style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>최근 소통 항목</h2>
            <Link href={`/portal/${tenant.slug}/qna`} className="btn outline" style={{ padding: "5px 12px", fontSize: "0.8rem" }}>
              Q&A 열기
            </Link>
          </div>
          <div className="panel-body" style={{ display: "grid", gap: 10 }}>
            {qnaItems.slice(0, 3).map((item) => (
              <div key={item.id} className="card" style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span className={`badge ${item.status === "완료" ? "ok" : item.status === "답변중" ? "info" : "warn"}`} style={{ fontSize: "0.7rem" }}>
                    {item.status}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-4)" }}>{item.askerName}</span>
                </div>
                <strong style={{ fontSize: "0.85rem", color: "var(--text-1)" }}>{item.question}</strong>
              </div>
            ))}
            {tenantRequests.slice(0, 2).map((request) => (
              <div key={request.id} className="card" style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span className={`badge ${request.status === "waiting_client" ? "warn" : "ok"}`} style={{ fontSize: "0.7rem" }}>
                    {request.status === "waiting_client" ? "고객 대기" : request.status}
                  </span>
                </div>
                <strong style={{ fontSize: "0.85rem", color: "var(--text-1)" }}>{request.title}</strong>
              </div>
            ))}
            {qnaItems.length === 0 && tenantRequests.length === 0 && (
              <div style={{ textAlign: "center", padding: 20, color: "var(--text-4)", fontSize: "0.85rem" }}>
                최근 소통 항목이 없습니다.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 납부서 현황 요약 */}
      <section className="panel">
        <div className="panel-header">
          <h2>이번 달 납부서 현황</h2>
          <Link href={`/portal/${tenant.slug}/tax`} className="btn outline" style={{ padding: "5px 12px", fontSize: "0.8rem" }}>
            세금 탭 이동
          </Link>
        </div>
        <div className="panel-body">
          <div className="grid grid-3" style={{ gap: 12 }}>
            {taxPayments.map((p) => (
              <div key={p.id} className="card" style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <strong style={{ fontSize: "0.9rem" }}>{p.taxType}</strong>
                  <span className={`badge ${p.status === "paid" ? "ok" : p.status === "notice_sent" ? "info" : p.status === "overdue" ? "err" : "warn"}`} style={{ fontSize: "0.7rem" }}>
                    {p.status === "pending" ? "송부 전" : p.status === "notice_sent" ? "송부 완료" : p.status === "paid" ? "납부 완료" : "기한 초과"}
                  </span>
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--text-4)" }}>기한: {p.dueDate}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PortalShell>
  );
}
