import Link from "next/link";
import { notFound } from "next/navigation";
import { PortalShell } from "@/components/PortalShell";
import { getTenantBySlug, monthlyReports, documents } from "@/lib/data";
import { getUserById } from "@/lib/users";

export default async function ReportsPage({ params }: { params: { tenantSlug: string } }) {
  const tenant = getTenantBySlug(params.tenantSlug);
  if (!tenant) return notFound();

  const list = monthlyReports.filter((r) => r.tenant_id === tenant.id);

  return (
    <PortalShell tenant={tenant} active="reports">
      <section className="main-card">
        <h2>분기별 경영 리포트</h2>
        <table>
          <thead>
            <tr>
              <th>분기</th>
              <th>요약</th>
              <th>대표확인</th>
              <th>작성자</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => {
              const doc = r.document_id ? documents.find((d) => d.id === r.document_id) : null;
              const writer = r.prepared_by ? getUserById(r.prepared_by)?.name : "-";
              return (
                <tr key={r.id}>
                  <td>{r.month}</td>
                  <td>
                    {doc ? <Link href={`/portal/${tenant.slug}/files`}>{doc.title}</Link> : r.summary ?? "-"}
                  </td>
                  <td>{r.owner_confirmed ? "확인완료" : "미확인"}</td>
                  <td>{writer}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="toolbar" style={{ marginTop: 12 }}>
          <button className="btn">대표 확인</button>
          <button className="btn secondary">리포트 업로드</button>
          <Link href="#" className="btn secondary">
            댓글 남기기(샘플)
          </Link>
        </div>
      </section>
    </PortalShell>
  );
}
