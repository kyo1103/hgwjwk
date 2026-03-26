import Link from "next/link";
import { notFound } from "next/navigation";
import { getTenantBySlug, employees } from "@/lib/data";
import { getTemplateByRequestType, autoGenerateWorkTasks } from "@/lib/workflow";

export default function NewRequestPage({ params, searchParams }: { params: { tenantSlug: string }; searchParams: { type?: string; employeeId?: string } }) {
  const tenant = getTenantBySlug(params.tenantSlug);
  if (!tenant) return notFound();

  const type = (searchParams?.type ?? "hire") as Parameters<typeof getTemplateByRequestType>[0];
  const template = getTemplateByRequestType(type);
  const selectedEmployee = searchParams?.employeeId ? employees.find((e) => e.id === searchParams.employeeId) : null;
  const previewTasks = autoGenerateWorkTasks({
    requestType: type,
    tenantSlug: tenant.slug,
    employeeId: selectedEmployee?.id,
    startDate: new Date().toISOString()
  });

  return (
    <div className="container">
      <div className="main-card">
        <h2>요청 등록(데모)</h2>
        <p>
          템플릿: {template?.name ?? "기본 템플릿 없음"} / 타입: {type}
        </p>
        <form className="grid two">
          <input placeholder="요청 제목" />
          <select defaultValue={type}>
            <option value="hire">입사</option>
            <option value="termination">퇴사</option>
            <option value="pay_change">급여변경</option>
            <option value="file_request">자료요청</option>
            <option value="labor">노무</option>
            <option value="tax">세무</option>
          </select>
          <textarea rows={6} placeholder="요청 내용" />
          <div className="card">
            <h4>자동 생성 체크리스트 미리보기</h4>
            {previewTasks.length ? (
              <ul>
                {previewTasks.map((t) => (
                  <li key={t.id}>
                    {t.domain} - {t.title} (D+{Math.ceil((Date.parse(t.due_at!) - Date.now()) / 86400000)})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">템플릿이 없습니다.</p>
            )}
          </div>
        </form>
        <p className="muted">요청 저장/업무 생성은 API 연동 단계에서 영구 반영됩니다.</p>
        <Link href={`/portal/${tenant.slug}/requests`} className="btn">
          목록으로
        </Link>
      </div>
    </div>
  );
}
