import { InternalShell } from "@/components/InternalShell";
import { getTenantBySlug, notifications, employees, serviceRequests, documents } from "@/lib/data";
import { getUserById } from "@/lib/users";
import { noticeLabel } from "@/lib/data";

export default function LogsPage() {
  return (
    <InternalShell active="로그/발송이력">
      <section className="main-card">
        <h2>로그 / 발송이력</h2>
        <table>
          <thead>
            <tr>
              <th>시각</th>
              <th>회사</th>
              <th>대상</th>
              <th>이벤트</th>
              <th>수행자</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((n) => {
              const tenant = getTenantBySlug("ooo-clinic");
              const performer = getUserById("u1");
              return (
                <tr key={n.id}>
                  <td>{n.sent_at ?? "-"}</td>
                  <td>{tenant?.name ?? "-"}</td>
                  <td>
                    {n.related_entity === "request"
                      ? serviceRequests.find((r) => r.id === n.related_id)?.title
                      : n.related_entity === "leave"
                        ? employees.find((e) => e.id === n.related_id)?.full_name
                        : documents.find((d) => d.id === n.related_id)?.title}
                  </td>
                  <td>{noticeLabel(n.type)} / {n.subject ?? n.body.slice(0, 20)}</td>
                  <td>{performer?.name}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </InternalShell>
  );
}
