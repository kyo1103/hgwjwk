import Link from "next/link";
import { InternalShell } from "@/components/InternalShell";
import { tenants, employees, memberships, monthlyReports, serviceRequests } from "@/lib/data";
import { getUserById } from "@/lib/users";

export default function TenantsPage() {
  return (
    <InternalShell active="고객사 관리">
      <section className="main-card">
        <h2>고객사 관리</h2>
        <table>
          <thead>
            <tr>
              <th>회사명</th>
              <th>담당자</th>
              <th>직원수</th>
              <th>최근 요청</th>
              <th>리포트 업로드</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => {
              const member = memberships.find((m) => m.tenant_id === t.id && m.role === "owner");
              const owner = member ? getUserById(member.user_id)?.name : "-";
              const report = monthlyReports.filter((r) => r.tenant_id === t.id).slice(-1)[0];
              return (
                <tr key={t.id}>
                  <td>
                    <Link href={`/portal/${t.slug}/dashboard`}>{t.name}</Link>
                  </td>
              <td>{owner}</td>
              <td>{employees.filter((e) => e.tenant_id === t.id).length}</td>
              <td>{serviceRequests.length ? serviceRequests.filter((r) => r.tenant_id === t.id).length : 0}건</td>
              <td>{report?.owner_confirmed ? "완료" : "미완료"}</td>
                  <td>
                    <button className="btn secondary">권한 변경</button>
                    <button className="btn secondary" style={{ marginLeft: 6 }}>
                      설정
                    </button>
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
