import Link from "next/link";
import { notFound } from "next/navigation";
import { PortalShell } from "@/components/PortalShell";
import { StatusBadge } from "@/components/StatusBadge";
import { getTenantBySlug, contracts, getEmployee } from "@/lib/data";
import { getUserById as findUser } from "@/lib/users";
import { ContractSender } from "./ContractSender";

export default async function ContractListPage({ params }: { params: { tenantSlug: string } }) {
  const tenant = getTenantBySlug(params.tenantSlug);
  if (!tenant) return notFound();

  const list = contracts.filter((c) => c.tenant_id === tenant.id);

  return (
    <PortalShell tenant={tenant} active="contracts">
      <div style={{ padding: "10px 0 40px" }}>

        {/* ── Interactive Sending Dashboard ── */}
        <ContractSender />

        {/* ── Contract History Table ── */}
        <div style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #eef0f6",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          overflow: "hidden"
        }}>
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "#111827", letterSpacing: "-0.01em" }}>
              근로계약 체결 내역
            </h2>
            <button className="btn secondary" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>
              📄 과거 서면계약서 스캔본 업로드
            </button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["계약서명", "대상 직원", "서명 유형", "버전", "진행 상태", "발송일", "담당자"].map(h => (
                  <th key={h} style={{
                    padding: "14px 24px",
                    textAlign: "left",
                    color: "#64748b",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "1px solid #f1f5f9"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((ct) => {
                const e = getEmployee(tenant.id, ct.employee_id);
                const owner = findUser(ct.created_by);
                return (
                  <tr key={ct.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "16px 24px" }}>
                      <Link
                        href={`/portal/${tenant.slug}/contracts/${ct.id}`}
                        style={{ color: "#3730a3", fontWeight: 700, textDecoration: "none" }}
                      >
                        {ct.title}
                      </Link>
                    </td>
                    <td style={{ padding: "16px 24px", color: "#334155", fontWeight: 600 }}>
                      {e?.full_name ?? "-"}
                    </td>
                    <td style={{ padding: "16px 24px", color: "#64748b" }}>
                      신규 입사
                    </td>
                    <td style={{ padding: "16px 24px", color: "#64748b" }}>
                      v{ct.version}.0
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <StatusBadge status={ct.status} />
                    </td>
                    <td style={{ padding: "16px 24px", color: "#64748b" }}>
                      {ct.created_at.slice(0, 10)}
                    </td>
                    <td style={{ padding: "16px 24px", color: "#94a3b8", fontSize: "0.85rem" }}>
                      {owner?.name ?? "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </PortalShell>
  );
}
