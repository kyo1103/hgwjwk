import Link from "next/link";
import { notFound } from "next/navigation";
import { PortalShell } from "@/components/PortalShell";
import { Badge } from "@/components/Badge";
import { StatusBadge } from "@/components/StatusBadge";
import {
  getTenantBySlug,
  getRequest,
  getRequestTasks,
  getRequestComments,
  getEmployee,
} from "@/lib/data";
import { users } from "@/lib/data";
import { getUserById } from "@/lib/users";

export default async function RequestDetailPage({ params }: { params: { tenantSlug: string; requestId: string } }) {
  const tenant = getTenantBySlug(params.tenantSlug);
  if (!tenant) return notFound();

  const request = getRequest(tenant.id, params.requestId);
  if (!request) return notFound();

  const employee = request.employee_id ? getEmployee(tenant.id, request.employee_id) : null;
  const tasks = getRequestTasks(tenant.id, request.id);
  const comments = getRequestComments(tenant.id, request.id);
  const labor = request.labor_owner ? users.find((u) => u.id === request.labor_owner) : null;
  const tax = request.tax_owner ? users.find((u) => u.id === request.tax_owner) : null;
  const requester = users.find((u) => u.id === request.requested_by);

  return (
    <PortalShell tenant={tenant} active="requests">
      <section className="main-card">
        <h2>요청 상세</h2>
        <div className="main-card" style={{ marginBottom: 12 }}>
          <p>
            <strong>{request.title}</strong> ({request.type})
          </p>
          <p>요청자: {requester?.name ?? request.requested_by}</p>
          <p>담당: {labor?.name ?? "미지정"} / {tax?.name ?? "미지정"}</p>
          <p>마감일: {request.due_date ?? "-"}</p>
          <p>상태: <StatusBadge status={request.status} /></p>
          <p>연결직원: {employee ? <Link href={`/portal/${tenant.slug}/people/${employee.id}`}>{employee.full_name}</Link> : "-"}</p>
          <p>{request.description}</p>
        </div>

        <h3>대화/댓글 타임라인</h3>
        {comments.length ? (
          comments.map((c) => {
            const author = getUserById(c.author_id);
            return (
              <div key={c.id} className="card" style={{ marginBottom: 10 }}>
                <p className="muted">
                  {author?.name ?? c.author_id} / {c.created_at.slice(0, 10)} / {c.visibility}
                </p>
                <p>{c.body}</p>
              </div>
            );
          })
        ) : (
          <p className="muted">타임라인 댓글이 없습니다.</p>
        )}

        <div className="grid two">
          <div className="card">
            <h4>자동 체크리스트(요청 템플릿)</h4>
            {tasks.map((t) => (
              <div key={t.id} style={{ marginBottom: 8 }}>
                <Badge tone={t.status === "done" ? "ok" : t.status === "doing" ? "warn" : "err"}>{t.status}</Badge> {t.domain} / {t.title}
                <div className="muted">{t.due_at ? `마감: ${t.due_at.slice(0, 10)}` : ""}</div>
              </div>
            ))}
            <button className="btn">체크리스트 템플릿 재적용</button>
          </div>

          <div className="card">
            <h4>첨부자료/활동</h4>
            <button className="btn secondary">📎 파일 첨부</button>
            <button className="btn secondary" style={{ marginTop: 8 }}>
              템플릿 답변(자료요청)
            </button>
          </div>
        </div>
      </section>
    </PortalShell>
  );
}
