import { notFound } from "next/navigation";
import { PortalShell } from "@/components/PortalShell";
import { Badge } from "@/components/Badge";
import { getTenantBySlug, getEmployee, contracts, getContractSigners, getContractFields } from "@/lib/data";

export default async function ContractDetailPage({ params }: { params: { tenantSlug: string; contractId: string } }) {
  const tenant = getTenantBySlug(params.tenantSlug);
  if (!tenant) return notFound();

  const contract = contracts.find((c) => c.tenant_id === tenant.id && c.id === params.contractId);
  if (!contract) return notFound();

  const employee = getEmployee(tenant.id, contract.employee_id);
  const signers = getContractSigners(contract.id);
  const fields = getContractFields(contract.id);

  return (
    <PortalShell tenant={tenant} active="contracts">
      <section className="main-card">
        <h2>{contract.title}</h2>
        <p>
          직원: {employee?.full_name ?? "-"} / 버전 {contract.version}
        </p>
        <p>
          상태: <Badge>{contract.status}</Badge> / 생성일: {contract.created_at.slice(0, 10)}
        </p>
        <div className="grid two">
          <div className="card">
            <h3>PDF 뷰어(데모)</h3>
            <div className="file-thumb" style={{ height: 240 }}>
              문서 미리보기 영역
            </div>
            <button className="btn">서명 위치 지정 모드</button>
          </div>

          <div className="card">
            <h3>필드/서명 정보</h3>
            {signers.map((s) => (
              <div key={s.id} className="card" style={{ marginBottom: 8 }}>
                <p>
                  {s.role}: {s.name} ({s.email})
                </p>
                <p className="muted">{s.signed_at ? `서명: ${s.signed_at.slice(0, 10)}` : "미서명"}</p>
              </div>
            ))}
            {fields.map((f) => (
              <p key={f.id} className="muted">
                {f.signer_role} / page:{f.page} / ({f.x_pct},{f.y_pct})
              </p>
            ))}
            <button className="btn secondary">서명 요청 이메일 발송</button>
            <button className="btn secondary" style={{ marginTop: 8 }}>
              회사 서명 확정
            </button>
          </div>
        </div>
        <h3>발송/로그</h3>
        <p className="muted">서명 이벤트 로그는 /app/logs에서 연계 확인 가능(데모)</p>
      </section>
    </PortalShell>
  );
}
