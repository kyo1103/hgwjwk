import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { PortalShell } from "@/components/PortalShell";
import { getPortalContext } from "@/lib/portal-context";
import { getTenantBySlug } from "@/lib/data";
import { portalStore } from "@/lib/server/portal-store";
import { CompanyEditForm } from "@/components/portal/CompanyEditForm";
import { billingContracts } from "@/lib/portal-content";

export default async function CompanyPage({ params }: { params: { tenantSlug: string } }) {
  const tenant = getTenantBySlug(params.tenantSlug);
  if (!tenant) return notFound();

  const context = getPortalContext(tenant);
  const companyInfo = portalStore.getCompanyInfo(params.tenantSlug);

  if (!companyInfo) return notFound();

  return (
    <PortalShell tenant={tenant} active="company">
      <div className="page-header">
        <div>
          <span className="label">Company Profile</span>
          <h1>업체 기본정보와 청구·계약 관리를 한 탭으로 통합</h1>
          <p className="sub">사업장 마이페이지 개념으로 설계. 대표자 민감정보는 권한자에게만 분리 노출됩니다.</p>
        </div>
      </div>

      {/* 편집 가능한 업체 기본정보 */}
      <div style={{ marginBottom: 24 }}>
        <CompanyEditForm
          tenantSlug={params.tenantSlug}
          initialInfo={companyInfo}
          canEditSensitive={context.access.canViewSensitiveOwnerDocs}
        />
      </div>

      {/* 청구 및 계약 관리 */}
      <section className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header">
          <h2>청구 및 계약 관리</h2>
          <Badge tone={context.access.canViewBilling ? "ok" : "warn"}>
            {context.access.canViewBilling ? "열람 가능" : "대표·전문가 전용"}
          </Badge>
        </div>
        <div className="panel-body">
          {context.access.canViewBilling ? (
            <div style={{ display: "grid", gap: 12 }}>
              {billingContracts.map((contract) => (
                <div key={contract.item} className="card" style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <div>
                      <strong style={{ display: "block", marginBottom: 4 }}>{contract.item}</strong>
                      <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-1)" }}>{contract.amount}</p>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexDirection: "column", alignItems: "flex-end" }}>
                      <Badge tone={contract.status === "완료" ? "ok" : contract.status === "대기" ? "warn" : "ok"}>
                        {contract.status}
                      </Badge>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-4)", textAlign: "right" }}>{contract.note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: 24, textAlign: "center" }}>
              <strong>청구·계약 세부 내역 비공개</strong>
              <p className="muted text-sm" style={{ marginTop: 8 }}>
                현재 역할은 계약 존재 여부와 진행 상태만 확인합니다.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 권한 설계 안내 */}
      <section className="panel">
        <div className="panel-header">
          <h2>탭 권한 설계 요약</h2>
          <Badge>{context.viewerRoleLabel}</Badge>
        </div>
        <div className="panel-body">
          <div className="grid grid-3" style={{ gap: 12 }}>
            <div className="card" style={{ padding: "16px 18px", borderLeft: `4px solid ${context.access.canViewSensitiveOwnerDocs ? "var(--green)" : "var(--amber)"}` }}>
              <strong style={{ display: "block", marginBottom: 6 }}>대표자 민감정보</strong>
              <p style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>
                {context.access.canViewSensitiveOwnerDocs
                  ? "현재 역할은 홈택스 ID, 공인인증서, 신분증 정보를 열람할 수 있습니다."
                  : "고객사 실무담당자에게는 기본 비노출. 대표·전문가 권한만 조회됩니다."}
              </p>
            </div>
            <div className="card" style={{ padding: "16px 18px", borderLeft: "4px solid var(--blue)" }}>
              <strong style={{ display: "block", marginBottom: 6 }}>사업자등록증 OCR</strong>
              <p style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>
                사업자등록증 업로드 시 업태·종목 자동 인식 후 사람이 최종 저장하는 흐름으로 설계 예정 (2차 패치).
              </p>
            </div>
            <div className="card" style={{ padding: "16px 18px", borderLeft: "4px solid var(--brand)" }}>
              <strong style={{ display: "block", marginBottom: 6 }}>전자계약 (OK Sign)</strong>
              <p style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>
                기장대리·노무 계약서의 전자서명 진행 현황은 <em>근로계약</em> 탭에서 별도 관리됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PortalShell>
  );
}
