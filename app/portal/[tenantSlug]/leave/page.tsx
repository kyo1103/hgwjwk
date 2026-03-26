import Link from "next/link";
import { notFound } from "next/navigation";
import { PortalShell } from "@/components/PortalShell";
import { getTenantBySlug, employees, leaveBalances, leavePromotions } from "@/lib/data";

export default async function LeavePage({ params }: { params: { tenantSlug: string } }) {
  const tenant = getTenantBySlug(params.tenantSlug);
  if (!tenant) return notFound();

  const balances = leaveBalances.filter((lb) => lb.tenant_id === tenant.id);
  const soon = balances.filter((lb) => {
    const d = new Date(lb.expiry_date);
    const remain = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return remain <= 90 && remain >= 0 && lb.remaining_days > 0;
  });

  return (
    <PortalShell tenant={tenant} active="leave">
      {/* Page header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <p className="label" style={{ marginBottom: 6 }}>Leave Management</p>
          <h1>연차 관리</h1>
          <p className="sub">{tenant.name} 연차 발생 및 사용 현황</p>
        </div>
      </div>

      {/* Legal Guide Panel */}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px", marginBottom: 32, display: "flex", gap: 16 }}>
        <div style={{ fontSize: "1.5rem", marginTop: 2 }}>💡</div>
        <div>
          <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "#1e293b", margin: "0 0 8px 0" }}>노무 가이드: 근로기준법 및 행정해석 안내</h4>
          <ul style={{ margin: 0, paddingLeft: 20, color: "#475569", fontSize: "0.9rem", lineHeight: 1.6 }}>
            <li><strong style={{ color: "#334155" }}>근로기준법 제60조 (연차 유급휴가):</strong> 1년간 80% 이상 출근한 근로자에게 15일의 유급휴가를 주어야 합니다.</li>
            <li><strong style={{ color: "#334155" }}>1년 미만 근로자의 연차:</strong> 1개월 개근 시 1일씩 최대 11일이 발생합니다. (단, 입사 1년이 되는 시점에 잔여 연차는 자동 소멸되며 이월을 허용하지 않을 수 있습니다.)</li>
            <li><strong style={{ color: "#334155" }}>연차사용촉진제:</strong> 소멸 6개월 전 1차 통보(근로자 사용시기 지정 촉구), 2개월 전 2차 통보(사용자가 시기 지정 후 강제 통지)를 통해 수당 지급 의무를 면제받을 수 있습니다.</li>
          </ul>
        </div>
      </div>

      <div className="grid two" style={{ marginBottom: 32 }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b", marginBottom: 16 }}>연차 Dashboard</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#64748b", fontWeight: 600 }}>전체 잔여 연차 합계</span>
              <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#334155" }}>{balances.reduce((acc, b) => acc + b.remaining_days, 0)}일</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#64748b", fontWeight: 600 }}>소멸 90일 이내 대상자</span>
              <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#e11d48" }}>{soon.length}명</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#64748b", fontWeight: 600 }}>1차 발송 필요 (미진행)</span>
              <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#d97706" }}>{soon.filter((b) => !leavePromotions.some((p) => p.tenant_id === tenant.id && p.employee_id === b.employee_id && p.promotion_type === "leave_promotion_1")).length}명</span>
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b", marginBottom: 16 }}>연차 촉진 발송 및 관리</h3>
          <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: 1.5, marginBottom: 20 }}>
            소멸 90일 이내 대상자에게 연차사용촉진 통보서를 전자 발송하거나 지면 출력을 위한 PDF를 다운로드합니다.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <button style={{ flex: 1, background: "#3730a3", color: "#fff", border: "none", padding: "10px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              ✈️ 1차 전자 발송
            </button>
            <button style={{ flex: 1, background: "#fff", color: "#3730a3", border: "1px solid #c7d2fe", padding: "10px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              ✈️ 2차 전자 발송
            </button>
            <button style={{ flex: "1 1 100%", background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "10px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              📥 서면 통보용 PDF 전체 다운로드
            </button>
          </div>
        </div>
      </div>
      <div className="main-card" style={{ marginTop: 12 }}>
        <h4>연차 현황</h4>
        <table>
          <thead>
            <tr>
              <th>직원</th>
              <th>잔여</th>
              <th>소멸일</th>
              <th>1차</th>
              <th>2차</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {balances.map((b) => {
              const e = employees.find((x) => x.id === b.employee_id);
              const has1 = leavePromotions.some((p) => p.employee_id === b.employee_id && p.promotion_type === "leave_promotion_1");
              const has2 = leavePromotions.some((p) => p.employee_id === b.employee_id && p.promotion_type === "leave_promotion_2");
              return (
                <tr key={b.id}>
                  <td>{e?.full_name ?? b.employee_id}</td>
                  <td>{b.remaining_days}일</td>
                  <td>{b.expiry_date}</td>
                  <td>{has1 ? "발송완료" : "미발송"}</td>
                  <td>{has2 ? "발송완료" : "미발송"}</td>
                  <td>
                    <Link href={`/portal/${tenant.slug}/people/${b.employee_id}?tab=leave`} className="btn">
                      상세
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}
