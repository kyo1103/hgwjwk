import Link from "next/link";
import { notFound } from "next/navigation";
import { PortalShell } from "@/components/PortalShell";
import { getTenantBySlug, documents, employees, getEmployee } from "@/lib/data";

export default async function FileVaultPage({ params }: { params: { tenantSlug: string } }) {
  const tenant = getTenantBySlug(params.tenantSlug);
  if (!tenant) return notFound();

  const tenantDocs = documents.filter((d) => d.tenant_id === tenant.id);

  return (
    <PortalShell tenant={tenant} active="files">
      <section className="main-card">
        <h2>문서함</h2>
        <div className="toolbar">
          <button className="btn">직원 선택 업로드</button>
          <select>
            <option>전체 분류</option>
            <option>contracts</option>
            <option>leave</option>
            <option>tax_withholding</option>
            <option>tax_insurance</option>
            <option>payroll</option>
          </select>
          <input placeholder="파일명/직원/분류 검색" />
          <button className="btn secondary">검색</button>
        </div>

        <div className="file-grid">
          {tenantDocs.map((doc) => {
            const emp = doc.employee_id ? getEmployee(tenant.id, doc.employee_id) : null;
            return (
              <div key={doc.id} className="file-card">
                <div className="file-thumb">PDF 썸네일</div>
                <strong>{doc.title}</strong>
                <p className="muted">{doc.category}</p>
                <p className="muted">{emp?.full_name ?? "회사 공용문서"}</p>
                <p className="muted">업로드: {doc.uploaded_at.slice(0, 10)}</p>
                <div className="toolbar">
                  <button className="btn secondary">보기</button>
                  <button className="btn secondary">다운로드</button>
                  {doc.employee_id ? (
                    <Link href={`/portal/${tenant.slug}/people/${doc.employee_id}`} className="btn">
                      직원이동
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </PortalShell>
  );
}
