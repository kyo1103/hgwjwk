import Link from "next/link";
import { InternalShell } from "@/components/InternalShell";
import { serviceRequests, getEmployee, tenants } from "@/lib/data";
import { getUserById } from "@/lib/users";
import { taskTemplates } from "@/lib/data";

const templatePreview = (type: string) => {
  const tpl = taskTemplates.find((t) => t.requestType === type);
  return tpl ? `${tpl.name} (${tpl.taskCount}개)` : "-";
};

export default function InternalRequestsPage() {
  return (
    <InternalShell active="요청함">
      <section className="main-card">
        <h2>요청 Inbox(분류/담당배정)</h2>
        <table>
          <thead>
            <tr>
              <th>요청번호</th>
              <th>회사</th>
              <th>유형</th>
              <th>상태</th>
              <th>담당자</th>
              <th>템플릿</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {serviceRequests.map((r) => {
              const tenant = tenants.find((t) => t.id === r.tenant_id);
              const employee = r.employee_id ? getEmployee(r.tenant_id, r.employee_id) : null;
              const user = getUserById(r.labor_owner ?? r.tax_owner ?? r.requested_by);
              return (
                <tr key={r.id}>
                  <td>
                    <Link href={`/portal/ooo-clinic/requests/${r.id}`}>{r.id}</Link>
                  </td>
                  <td>{tenant?.name ?? r.tenant_id}</td>
                  <td>{r.type}</td>
                  <td>{r.status}</td>
                  <td>{user?.name ?? "미지정"}</td>
                  <td>{templatePreview(r.type)}</td>
                  <td className="muted">{employee?.full_name}</td>
                  <td>
                    <button className="btn secondary">템플릿 적용</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </InternalShell>
  );
}
