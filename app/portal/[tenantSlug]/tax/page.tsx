import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { PortalShell } from "@/components/PortalShell";
import { getPortalContext } from "@/lib/portal-context";
import { getTenantBySlug } from "@/lib/data";
import { portalStore } from "@/lib/server/portal-store";
import { TaxSection } from "@/components/portal/TaxSection";
import { TaxPaymentPanel } from "@/components/portal/TaxPaymentPanel";
import { PopbillDataPanel } from "@/components/portal/PopbillDataPanel";

export default async function TaxPage({ params }: { params: { tenantSlug: string } }) {
  const tenant = getTenantBySlug(params.tenantSlug);
  if (!tenant) return notFound();

  const context = getPortalContext(tenant);
  const taxFiles = portalStore.getTaxFiles(params.tenantSlug);
  const taxPayments = portalStore.getTaxPayments(params.tenantSlug);

  const canReview =
    context.viewerRole === "tax_advisor" ||
    context.viewerRole === "tax_staff" ||
    context.viewerRole === "labor_advisor";

  const counts = {
    pending: taxFiles.filter((f) => f.reviewStatus === "pending").length,
    done: taxFiles.filter((f) => f.reviewStatus === "done").length,
    total: taxFiles.length,
  };

  return (
    <PortalShell tenant={tenant} active="tax">
      <div className="page-header">
        <div>
          <span className="label">Tax Filing Center</span>
          <h1>세금 신고 대비 자료와 납부서 흐름을 한 탭에서</h1>
          <p className="sub">드래그 앤 드롭 업로드, 확인완료 처리, 납부서 송부를 한 흐름으로 처리합니다.</p>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: "전체 파일", value: counts.total, color: "var(--text-1)" },
          { label: "검토 대기", value: counts.pending, color: "var(--amber)" },
          { label: "확인 완료", value: counts.done, color: "var(--green)" },
          { label: "납부서 송부 완료", value: taxPayments.filter((p) => p.status === "notice_sent").length, color: "var(--blue)" },
        ].map((item) => (
          <div key={item.label} className="stat-card">
            <div className="num" style={{ color: item.color }}>{item.value}</div>
            <div>
              <div className="lbl" style={{ color: "var(--text-1)", fontWeight: 700 }}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 자료 업로드 + 파일 목록 */}
      <section className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header">
          <h2>고객사 자료 업로드</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <Badge tone="ok">드래그 앤 드롭</Badge>
            {counts.pending > 0 && <Badge tone="warn">{counts.pending}건 검토 대기</Badge>}
          </div>
        </div>
        <div className="panel-body">
          <TaxSection
            tenantSlug={params.tenantSlug}
            initialFiles={taxFiles}
            canReview={canReview}
          />
        </div>
      </section>

      {/* 납부서 관리 */}
      <section className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header">
          <h2>세금 납부서 관리</h2>
          <Badge tone={context.access.canViewTaxPayments ? "ok" : "warn"}>
            {context.access.canViewTaxPayments ? "열람 가능" : "열람 제한"}
          </Badge>
        </div>
        <div className="panel-body">
          {context.access.canViewTaxPayments ? (
            <TaxPaymentPanel
              tenantSlug={params.tenantSlug}
              initialPayments={taxPayments}
              canSend={canReview}
            />
          ) : (
            <div className="card" style={{ textAlign: "center", padding: 24, color: "var(--text-4)" }}>
              납부서 세부 내역은 세무사·대표 권한에서만 열람됩니다.
            </div>
          )}
        </div>
      </section>

      {/* 팝빌 홈택스 스크래핑 — 세금계산서·현금영수증 자동 수집 */}
      {canReview && (
        <div style={{ marginBottom: 24 }}>
          <PopbillDataPanel
            tenantSlug={params.tenantSlug}
          />
        </div>
      )}

      {/* 신고기한 알림 */}
      <section className="panel">
        <div className="panel-header">
          <h2>공문·신고기한 알림</h2>
          <Badge tone="warn">리마인드</Badge>
        </div>
        <div className="panel-body" style={{ display: "grid", gap: 12 }}>
          {[
            { title: "3월 원천세 신고 기한", date: "2026-04-10", state: "알림 예정", tone: "warn" as const },
            { title: "1기 예정 부가세 준비", date: "2026-04-25", state: "공문 초안 작성", tone: "warn" as const },
            { title: "보수총액신고 점검", date: "2026-03-31", state: "확인 필요", tone: "err" as const },
          ].map((notice) => (
            <div key={notice.title} className="card" style={{ padding: "14px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <strong>{notice.title}</strong>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-4)" }}>{notice.date}</span>
                  <Badge tone={notice.tone}>{notice.state}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
