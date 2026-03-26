import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { PortalShell } from "@/components/PortalShell";
import { getPortalContext } from "@/lib/portal-context";
import { getTenantBySlug } from "@/lib/data";
import { portalStore } from "@/lib/server/portal-store";
import { CertIssuePanel } from "@/components/portal/CertIssuePanel";

export default async function CertificatesPage({ params }: { params: { tenantSlug: string } }) {
  const tenant = getTenantBySlug(params.tenantSlug);
  if (!tenant) return notFound();

  const context = getPortalContext(tenant);
  const certHistory = portalStore.getCertHistory(params.tenantSlug);

  return (
    <PortalShell tenant={tenant} active="certificates">
      <div className="page-header">
        <div>
          <span className="label">Certificates</span>
          <h1>자주 쓰는 민원증명서류를 바로 발급하는 셀프 발급기</h1>
          <p className="sub">홈택스·위택스·4대보험 8종 서류를 버튼 하나로 발급합니다. 발급 이력도 자동 저장됩니다.</p>
        </div>
      </div>

      {/* 안내 카드 */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: "발급 가능 문서", value: "8종", hint: "홈택스 5·위택스 1·4대보험 2" },
          { label: "현재 권한", value: context.viewerRoleLabel, hint: context.access.canIssueCertificates ? "발급 가능" : "발급 제한" },
          { label: "총 발급 이력", value: `${certHistory.length}건`, hint: "누계" },
          { label: "발급 방식", value: "자동화", hint: "홈택스 Bridge 연동" },
        ].map((item) => (
          <div key={item.label} className="stat-card">
            <div className="num" style={{ fontSize: "1.4rem" }}>{item.value}</div>
            <div>
              <div className="lbl" style={{ color: "var(--text-1)", fontWeight: 700 }}>{item.label}</div>
              <div className="text-sm muted">{item.hint}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 권한 안내 */}
      {!context.access.canIssueCertificates && (
        <div className="card" style={{ marginBottom: 20, padding: "16px 20px", borderLeft: "4px solid var(--amber)", background: "var(--amber-bg)" }}>
          <strong>현재 역할({context.viewerRoleLabel})은 민원증명 발급이 제한됩니다.</strong>
          <p style={{ marginTop: 4, fontSize: "0.82rem", color: "var(--text-3)" }}>
            대표자 또는 전문가(세무사·노무사) 권한으로 접속하면 발급 버튼이 활성화됩니다.
          </p>
        </div>
      )}

      <section className="panel">
        <div className="panel-header">
          <h2>민원증명 발급</h2>
          <Badge tone={context.access.canIssueCertificates ? "ok" : "warn"}>
            {context.access.canIssueCertificates ? "발급 가능" : "제한됨"}
          </Badge>
        </div>
        <div className="panel-body">
          <CertIssuePanel
            tenantSlug={params.tenantSlug}
            initialHistory={certHistory}
            canIssue={context.access.canIssueCertificates}
          />
        </div>
      </section>
    </PortalShell>
  );
}
