import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { PortalShell } from "@/components/PortalShell";
import { getPortalContext } from "@/lib/portal-context";
import { getTenantBySlug } from "@/lib/data";
import { portalStore } from "@/lib/server/portal-store";
import { InsightManager } from "@/components/portal/InsightManager";

export default async function InsightsPage({ params }: { params: { tenantSlug: string } }) {
  const tenant = getTenantBySlug(params.tenantSlug);
  if (!tenant) return notFound();

  const context = getPortalContext(tenant);
  const posts = portalStore.getAllInsightPosts();

  const canWrite =
    context.viewerRole === "tax_advisor" ||
    context.viewerRole === "labor_advisor" ||
    context.viewerRole === "tax_staff";

  // 공개 포스트만 고객사에 보여줌
  const visiblePosts = canWrite ? posts : posts.filter((p) => !p.isDraft);

  return (
    <PortalShell tenant={tenant} active="insights">
      <div className="page-header">
        <div>
          <span className="label">Editorial Layer</span>
          <h1>세무 칼럼과 노무 코멘트를 공지형으로 운영</h1>
          <p className="sub">고객사마다 따로 업로드하는 대신 전체 공지와 업종 맞춤 코멘트를 분리해 효율적으로 전달합니다.</p>
        </div>
      </div>

      {/* 카테고리 안내 */}
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        {[
          { title: "전체 공지", text: "개정사항, 신고시즌 리스크, 접대비 등 공통 주제를 배포합니다.", count: posts.filter(p => p.audience === "전체 공지" && !p.isDraft).length },
          { title: "업종별 코멘트", text: "의원, 제조, 서비스업 등 업종별 실무 포인트를 나눕니다.", count: posts.filter(p => p.audience === "업종 맞춤" && !p.isDraft).length },
          { title: "지원금 알림", text: "세무·노무가 확인한 공고를 같은 탭에서 공유합니다.", count: posts.filter(p => p.category === "지원금 안내" && !p.isDraft).length },
        ].map((item) => (
          <div key={item.title} className="card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong>{item.title}</strong>
              <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--brand-mid)" }}>{item.count}</span>
            </div>
            <p className="muted text-sm">{item.text}</p>
          </div>
        ))}
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>콘텐츠 목록</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <Badge tone="ok">공지형 운영</Badge>
            {canWrite && <Badge tone="warn">작성자 모드</Badge>}
          </div>
        </div>
        <div className="panel-body">
          <InsightManager initialPosts={visiblePosts} canWrite={canWrite} />
        </div>
      </section>
    </PortalShell>
  );
}
