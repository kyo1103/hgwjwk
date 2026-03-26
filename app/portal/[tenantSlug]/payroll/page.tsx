import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { PortalShell } from "@/components/PortalShell";
import { getPortalContext } from "@/lib/portal-context";
import { getTenantBySlug } from "@/lib/data";
import { portalStore } from "@/lib/server/portal-store";
import { PayrollEmployeePanel } from "@/components/portal/PayrollEmployeePanel";
import { PayrollRevisionList } from "@/components/portal/PayrollRevisionList";
import { payrollCompanySettings } from "@/lib/portal-content";

export default async function PayrollPage({ params }: { params: { tenantSlug: string } }) {
  const tenant = getTenantBySlug(params.tenantSlug);
  if (!tenant) return notFound();

  const context = getPortalContext(tenant);
  const employees = portalStore.getEmployees(params.tenantSlug);
  const revisions = portalStore.getPayrollRevisions(params.tenantSlug);

  const activeCount = employees.filter((e) => e.status === "active").length;
  const inactiveCount = employees.filter((e) => e.status === "inactive").length;

  return (
    <PortalShell tenant={tenant} active="payroll">
      <div className="page-header">
        <div>
          <span className="label">Payroll Hub</span>
          <h1>고객사 · 세무 · 노무가 같이 쓰는 급여 탭</h1>
          <p className="sub">사원 등록부터 급여명세서 전달, 수정 히스토리까지 3방향 연동으로 관리합니다.</p>
        </div>
      </div>

      {/* 요약 */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: "재직 인원", value: `${activeCount}명`, color: "var(--text-1)" },
          { label: "퇴직 인원", value: `${inactiveCount}명`, color: "var(--text-3)" },
          { label: "이번 달 수정 이력", value: `${revisions.filter(r => r.yearMonth === new Date().toISOString().slice(0, 7)).length}건`, color: "var(--amber)" },
          { label: "급여 지급일", value: "매월 25일", color: "var(--brand-mid)" },
        ].map((item) => (
          <div key={item.label} className="stat-card">
            <div className="num" style={{ color: item.color, fontSize: "1.6rem" }}>{item.value}</div>
            <div>
              <div className="lbl" style={{ color: "var(--text-1)", fontWeight: 700 }}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 회사 세팅 */}
      <section className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header">
          <h2>회사 급여 세팅</h2>
          <Badge tone={context.access.canManagePayroll ? "ok" : "warn"}>
            {context.access.canManagePayroll ? "운영 가능" : "열람 중심"}
          </Badge>
        </div>
        <div className="panel-body">
          <div className="grid grid-4" style={{ gap: 14 }}>
            {payrollCompanySettings.map((setting) => (
              <div key={setting.label} className="card" style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-3)", fontWeight: 600, marginBottom: 6 }}>{setting.label}</div>
                <strong style={{ fontSize: "0.95rem", color: "var(--text-1)" }}>{setting.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 사원 등록 */}
      <section className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header">
          <h2>사원 등록·관리</h2>
          <Badge tone="ok">고객사 입력 기반</Badge>
        </div>
        <div className="panel-body">
          <PayrollEmployeePanel
            tenantSlug={params.tenantSlug}
            initialEmployees={employees}
          />
        </div>
      </section>

      {/* 월별 운영 흐름 */}
      <section className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header">
          <h2>월별 운영 흐름</h2>
          <Badge tone="ok">3방향 연동</Badge>
        </div>
        <div className="panel-body">
          <div className="grid grid-3" style={{ gap: 12 }}>
            {[
              { lane: "고객사", items: ["월별 변동자 입력 (입·퇴사, 급여변동)", "표준 엑셀 업로드 (다수 인원)", "부양가족 변경 사항 등록"] },
              { lane: "노무사", items: ["신규 입사자 근로계약 연동 검토", "근로형태 판정 및 특이사항 확인", "급여명세서 노무 검수"] },
              { lane: "세무사", items: ["급여대장 작성 및 명세서 발행", "원천세·4대보험 반영", "수정 히스토리 기록"] },
            ].map((lane) => (
              <div key={lane.lane} className="card" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "var(--brand-pale)", color: "var(--brand-mid)" }}>
                    {lane.lane}
                  </span>
                </div>
                <ul style={{ listStyle: "none", display: "grid", gap: 8 }}>
                  {lane.items.map((item) => (
                    <li key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: "0.82rem", color: "var(--text-2)" }}>
                      <span style={{ color: "var(--brand)", flexShrink: 0, marginTop: 2 }}>›</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 수정 히스토리 */}
      <section className="panel">
        <div className="panel-header">
          <h2>수정 히스토리 가시화</h2>
          <Badge tone="warn">로그보다 화면 중심</Badge>
        </div>
        <div className="panel-body">
          <PayrollRevisionList revisions={revisions} />
        </div>
      </section>
    </PortalShell>
  );
}
