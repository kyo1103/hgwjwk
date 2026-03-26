import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { PortalShell } from "@/components/PortalShell";
import { getPortalContext } from "@/lib/portal-context";
import { getTenantBySlug } from "@/lib/data";
import { portalStore } from "@/lib/server/portal-store";
import { QnaPanel } from "@/components/portal/QnaPanel";

export default async function QnaPage({ params }: { params: { tenantSlug: string } }) {
  const tenant = getTenantBySlug(params.tenantSlug);
  if (!tenant) return notFound();

  const context = getPortalContext(tenant);
  const items = portalStore.getQnaItems(params.tenantSlug);

  const canAnswer =
    context.viewerRole === "tax_advisor" ||
    context.viewerRole === "tax_staff" ||
    context.viewerRole === "labor_advisor" ||
    context.viewerRole === "labor_staff";

  const pendingCount = items.filter((q) => q.status === "답변대기").length;
  const doneCount = items.filter((q) => q.status === "완료").length;

  return (
    <PortalShell tenant={tenant} active="qna">
      <div className="page-header">
        <div>
          <span className="label">Q&A Workflow</span>
          <h1>챗봇 1차 응답과 전문가 전환이 같이 보이는 Q&A 탭</h1>
          <p className="sub">단순 안내는 빠르게, 세무·노무 판단이 필요한 질문은 담당자에게 직접 연결됩니다.</p>
        </div>
      </div>

      {/* 요약 */}
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        {[
          { label: "전체 질문", value: items.length },
          { label: "답변 대기", value: pendingCount },
          { label: "완료", value: doneCount },
        ].map((item) => (
          <div key={item.label} className="stat-card">
            <div className="num">{item.value}</div>
            <div><div className="lbl" style={{ color: "var(--text-1)", fontWeight: 700 }}>{item.label}</div></div>
          </div>
        ))}
      </div>

      {pendingCount > 0 && canAnswer && (
        <div className="card" style={{ marginBottom: 20, padding: "14px 20px", borderLeft: "4px solid var(--amber)", background: "var(--amber-bg)" }}>
          <strong>{pendingCount}건의 답변 대기 질문이 있습니다.</strong>
          <p style={{ marginTop: 4, fontSize: "0.82rem", color: "var(--text-3)" }}>
            아래 질문 목록에서 확인 후 답변을 등록해 주세요.
          </p>
        </div>
      )}

      <QnaPanel
        tenantSlug={params.tenantSlug}
        initialItems={items}
        canAnswer={canAnswer}
      />
    </PortalShell>
  );
}
