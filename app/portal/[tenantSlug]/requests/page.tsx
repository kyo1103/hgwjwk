import Link from "next/link";
import { notFound } from "next/navigation";
import { PortalShell } from "@/components/PortalShell";
import { StatusBadge } from "@/components/StatusBadge";
import { getTenantBySlug, serviceRequests, getEmployee } from "@/lib/data";
import { getUserById } from "@/lib/users";

export default async function RequestsPage({
  params,
  searchParams
}: {
  params: { tenantSlug: string };
  searchParams: { status?: string; type?: string; q?: string; assignee?: string };
}) {
  const tenant = getTenantBySlug(params.tenantSlug);
  if (!tenant) return notFound();

  const list = serviceRequests
    .filter((r) => r.tenant_id === tenant.id)
    .filter((r) => (searchParams?.status ? r.status === searchParams.status : true))
    .filter((r) => (searchParams?.type ? r.type === searchParams.type : true))
    .filter((r) => {
      const keyword = (searchParams?.q ?? "").toLowerCase();
      if (!keyword) return true;
      return `${r.title} ${r.description ?? ""}`.toLowerCase().includes(keyword);
    })
    .filter((r) => {
      if (!searchParams?.assignee) return true;
      return r.labor_owner === searchParams.assignee || r.tax_owner === searchParams.assignee || r.requested_by === searchParams.assignee;
    });

  return (
    <PortalShell tenant={tenant} active="requests">
      <section className="main-card">
        <h2>요청(티켓) 목록</h2>
        <form className="toolbar">
          <select name="status" defaultValue={searchParams?.status ?? ""}>
            <option value="">상태 전체</option>
            <option value="received">접수</option>
            <option value="in_progress">처리중</option>
            <option value="waiting_client">고객대기</option>
            <option value="done">완료</option>
          </select>
          <select name="type" defaultValue={searchParams?.type ?? ""}>
            <option value="">유형 전체</option>
            <option value="hire">입사</option>
            <option value="termination">퇴사</option>
            <option value="pay_change">급여변경</option>
            <option value="labor">노무</option>
            <option value="tax">세무</option>
            <option value="file_request">자료요청</option>
          </select>
          <input name="q" defaultValue={searchParams?.q ?? ""} placeholder="제목 검색" />
          <button className="btn">조회</button>
          <Link href={`/portal/${tenant.slug}/requests/new`} className="btn secondary">
            ➕ 요청 등록
          </Link>
        </form>

        <table>
          <thead>
            <tr>
              <th>요청번호</th>
              <th>제목</th>
              <th>유형</th>
              <th>상태</th>
              <th>마감일</th>
              <th>담당</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => {
              const owner = getUserById(r.labor_owner ?? r.tax_owner ?? r.requested_by);
              const emp = r.employee_id ? getEmployee(tenant.id, r.employee_id) : null;
              return (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>
                    <Link href={`/portal/${tenant.slug}/requests/${r.id}`}>{r.title}</Link>
                    {emp ? <span className="muted"> / {emp.full_name}</span> : null}
                  </td>
                  <td>{r.type}</td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td>{r.due_date ?? "-"}</td>
                  <td>{owner?.name ?? "미지정"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </PortalShell>
  );
}
