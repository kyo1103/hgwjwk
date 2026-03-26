import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { PortalShell } from "@/components/PortalShell";
import { getPortalContext } from "@/lib/portal-context";
import { getTenantBySlug } from "@/lib/data";
import { portalStore } from "@/lib/server/portal-store";
import { ConsultingManager } from "@/components/portal/ConsultingManager";

export default async function ConsultingPage({ params }: { params: { tenantSlug: string } }) {
  const tenant = getTenantBySlug(params.tenantSlug);
  if (!tenant) return notFound();

  const context = getPortalContext(tenant);
  const projects = portalStore.getConsultingProjects(params.tenantSlug);

  const activeCount = projects.filter((p) => p.status !== "completed").length;
  const completedCount = projects.filter((p) => p.status === "completed").length;

  return (
    <PortalShell tenant={tenant} active="consulting">
      <div className="page-header">
        <div>
          <span className="label">Special Consulting</span>
          <h1>프로젝트형 컨설팅의 진행상황과 효과를 따로 관리</h1>
          <p className="sub">사내근로복지기금, 정관 컨설팅 등 별도 프로젝트를 자료수집부터 완료까지 추적합니다.</p>
        </div>
      </div>

      {/* 요약 */}
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        {[
          { label: "전체 프로젝트", value: projects.length },
          { label: "진행 중", value: activeCount },
          { label: "완료", value: completedCount },
        ].map((item) => (
          <div key={item.label} className="stat-card">
            <div className="num">{item.value}</div>
            <div><div className="lbl" style={{ color: "var(--text-1)", fontWeight: 700 }}>{item.label}</div></div>
          </div>
        ))}
      </div>

      {!context.access.canManageConsulting ? (
        <section className="panel">
          <div className="panel-header">
            <h2>열람 제한</h2>
            <Badge tone="warn">{context.viewerRoleLabel}</Badge>
          </div>
          <div className="panel-body">
            <div className="card">
              <strong>특별 컨설팅 전체 관리 권한이 없습니다.</strong>
              <p className="muted text-sm" style={{ marginTop: 8 }}>
                고객사 직원 권한은 프로젝트 존재 여부만 보이고, 세부 자료와 효과 리포트는 대표 또는 전문가 권한에서 관리합니다.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <ConsultingManager
          tenantSlug={params.tenantSlug}
          initialProjects={projects}
          canManage={context.access.canManageConsulting}
        />
      )}
    </PortalShell>
  );
}
