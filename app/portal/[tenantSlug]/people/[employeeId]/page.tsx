import { notFound } from "next/navigation";
import Link from "next/link";
import { PortalShell } from "@/components/PortalShell";
import { getTenantBySlug, getEmployee, getEmployeeDocuments, getEmployeeTasks, getEmployeeRequests, getEmployeeLeaveBalance, getEmployeeContracts } from "@/lib/data";
import { getUserById } from "@/lib/users";

function parseDate(date?: string) {
  return date ? date.slice(0, 10) : "-";
}

export default async function EmployeePage({
  params,
  searchParams
}: {
  params: { tenantSlug: string; employeeId: string };
  searchParams: { tab?: string };
}) {
  const tenant = getTenantBySlug(params.tenantSlug);
  if (!tenant) return notFound();

  const employee = getEmployee(tenant.id, params.employeeId);
  if (!employee) return notFound();

  const tab = searchParams.tab ?? "documents";
  const docs = getEmployeeDocuments(tenant.id, employee.id);
  const tasks = getEmployeeTasks(tenant.id, employee.id);
  const reqs = getEmployeeRequests(tenant.id, employee.id);
  const leave = getEmployeeLeaveBalance(tenant.id, employee.id);
  const contracts = getEmployeeContracts(tenant.id, employee.id);

  const tabMap = {
    documents: "documents",
    contracts: "contracts",
    leave: "leave",
    tax: "tax",
    requests: "requests",
    memo: "memo"
  };
  const activeTab = tabMap[tab as keyof typeof tabMap] ?? "documents";

  return (
    <PortalShell tenant={tenant} active="people">
      <section className="main-card">
        <h2>직원 페이지</h2>
        <div className="grid two">
          <div>
            <h3>{employee.full_name}</h3>
            <p>{employee.department ?? ""} / {employee.job_title ?? "-"}</p>
            <p>입사일: {parseDate(employee.hire_date)}</p>
            <p>근속: {Math.max(0, new Date().getFullYear() - new Date(employee.hire_date).getFullYear())}년</p>
            <p>상태: {employee.employment_status}</p>
          </div>
          <div className="toolbar">
            <button className="btn">📤 문서 업로드</button>
            <button className="btn secondary">➕ 요청 생성</button>
            <button className="btn secondary">✍️ 계약서 보기</button>
            <button className="btn secondary">🧾 세무 업무 보기</button>
          </div>
        </div>

        <div className="tabs" style={{ marginTop: 14 }}>
          <Link href={`/portal/${tenant.slug}/people/${employee.id}?tab=documents`} className={activeTab === "documents" ? "tab active" : "tab"}>
            문서(파일)
          </Link>
          <Link href={`/portal/${tenant.slug}/people/${employee.id}?tab=contracts`} className={activeTab === "contracts" ? "tab active" : "tab"}>
            계약서
          </Link>
          <Link href={`/portal/${tenant.slug}/people/${employee.id}?tab=leave`} className={activeTab === "leave" ? "tab active" : "tab"}>
            연차·휴가
          </Link>
          <Link href={`/portal/${tenant.slug}/people/${employee.id}?tab=tax`} className={activeTab === "tax" ? "tab active" : "tab"}>
            세무
          </Link>
          <Link href={`/portal/${tenant.slug}/people/${employee.id}?tab=requests`} className={activeTab === "requests" ? "tab active" : "tab"}>
            요청
          </Link>
          <Link href={`/portal/${tenant.slug}/people/${employee.id}?tab=memo`} className={activeTab === "memo" ? "tab active" : "tab"}>
            메모
          </Link>
        </div>

        {activeTab === "documents" ? (
          <div className="file-grid">
            {docs.map((doc) => (
              <div className="file-card" key={doc.id}>
                <div className="file-thumb">PDF 썸네일</div>
                <strong>{doc.title}</strong>
                <p className="muted">{doc.category} / v{doc.version}</p>
                <p className="muted">업로드: {doc.uploaded_at.slice(0, 10)}</p>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "contracts" ? (
          <table>
            <thead>
              <tr>
                <th>계약명</th>
                <th>버전</th>
                <th>상태</th>
                <th>생성일</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((ct) => (
                <tr key={ct.id}>
                  <td>
                    <Link href={`/portal/${tenant.slug}/contracts/${ct.id}`}>{ct.title}</Link>
                  </td>
                  <td>{ct.version}</td>
                  <td>{ct.status}</td>
                  <td>{ct.created_at.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}

        {activeTab === "leave" ? (
          <div className="grid two">
            <div className="card">
              <h4>연차</h4>
              <p>잔여: {leave?.remaining_days ?? 0}일</p>
              <p>사용: {leave?.used_days ?? 0}일</p>
              <p>소멸예정일: {leave?.expiry_date ?? "-"}</p>
            </div>
            <div className="card">
              <h4>연차촉진</h4>
              <p>지금은 데모 데이터 기준</p>
              <button className="btn">촉진 1차 대상 지정/발송</button>
            </div>
          </div>
        ) : null}

        {activeTab === "tax" ? (
          <div className="grid two">
            <div className="card">
              <h4>세무 업무</h4>
              {tasks
                .filter((t) => t.domain === "세무" || t.domain === "공통")
                .map((t) => (
                  <p key={t.id}>
                    [{t.status}] {t.title}
                  </p>
                ))}
            </div>
            <div className="card">
              <h4>요청 연동</h4>
              {reqs.map((r) => (
                <p key={r.id}>
                  <Link href={`/portal/${tenant.slug}/requests/${r.id}`}>{r.title}</Link>
                </p>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "requests" ? (
          <div className="card">
            <h4>요청(티켓)</h4>
            {reqs.map((r) => {
              const owner = getUserById(r.labor_owner ?? r.tax_owner ?? r.requested_by);
              return (
                <div key={r.id} style={{ marginBottom: 8 }}>
                  <strong>
                    <Link href={`/portal/${tenant.slug}/requests/${r.id}`}>{r.title}</Link>
                  </strong>
                  <p className="muted">
                    {r.type} / {r.status} / 담당: {owner?.name ?? "미지정"} / 마감: {r.due_date ?? "-"}
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}

        {activeTab === "memo" ? (
          <div className="card">
            <h4>내부 메모</h4>
            <p className="muted">직원 관련 민감 메모는 고객에게 비노출</p>
            <textarea rows={6} placeholder="내부 메모 입력(데모)" />
          </div>
        ) : null}
      </section>
    </PortalShell>
  );
}
