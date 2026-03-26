import Link from "next/link";
import { notFound } from "next/navigation";
import { PortalShell } from "@/components/PortalShell";
import { getTenantBySlug, employees, getEmployeeDocuments, getEmployeeRequests } from "@/lib/data";
import { StatusBadge } from "@/components/StatusBadge";

function formatDate(iso: string) {
  return iso.slice(0, 10);
}

export default async function PeoplePage({
  params,
  searchParams,
}: {
  params: { tenantSlug: string };
  searchParams: { q?: string; status?: string; dept?: string; job?: string; issue?: string };
}) {
  const tenant = getTenantBySlug(params.tenantSlug);
  if (!tenant) return notFound();

  const q = (searchParams?.q ?? "").trim().toLowerCase();
  const status = searchParams?.status;
  const dept = searchParams?.dept?.toLowerCase();
  const job = searchParams?.job?.toLowerCase();
  const showIssuesOnly = searchParams?.issue === "true";

  const list = employees
    .filter((e) => e.tenant_id === tenant.id)
    .filter((e) => (status ? e.employment_status === status : true))
    .filter((e) => (dept ? (e.department ?? "").toLowerCase().includes(dept) : true))
    .filter((e) => (job ? (e.job_title ?? "").toLowerCase().includes(job) : true))
    .filter((e) => (showIssuesOnly ? e.is_risk === true : true))
    .filter((e) => {
      const target = `${e.full_name} ${e.job_title ?? ""} ${e.department ?? ""}`.toLowerCase();
      return q ? target.includes(q) : true;
    });

  return (
    <PortalShell tenant={tenant} active="people">

      {/* Page header */}
      <div className="page-header">
        <div>
          <p className="label" style={{ marginBottom: 6 }}>People</p>
          <h1>직원명부</h1>
          <p className="sub">{tenant.name} 재직 인원 현황</p>
        </div>
        <Link href={`/portal/${tenant.slug}/people/new`} className="btn" style={{ gap: 8 }}>
          + 직원 등록
        </Link>
      </div>

      {/* Filter bar */}
      <form style={{
        background: "#fff",
        border: "1px solid #f0f2f8",
        borderRadius: 12,
        padding: "18px 20px",
        display: "flex", flexWrap: "wrap", gap: 10,
        alignItems: "flex-end",
        marginBottom: 24,
        boxShadow: "0 1px 3px rgba(0,0,0,.05)",
      }}>
        <div style={{ flex: "2 1 200px" }}>
          <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
            검색
          </label>
          <input name="q" defaultValue={q} placeholder="이름, 직책, 부서 검색" />
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
            재직 상태
          </label>
          <select name="status" defaultValue={status ?? ""}>
            <option value="">전체</option>
            <option value="active">재직</option>
            <option value="terminated">퇴사</option>
            <option value="leave">휴직</option>
          </select>
        </div>
        <div style={{ flex: "1 1 130px" }}>
          <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
            부서
          </label>
          <input name="dept" defaultValue={searchParams?.dept ?? ""} placeholder="부서명" />
        </div>
        <div style={{ flex: "1 1 130px" }}>
          <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
            직책
          </label>
          <input name="job" defaultValue={searchParams?.job ?? ""} placeholder="직책명" />
        </div>
        <div style={{ flex: "1 1 auto", display: "flex", alignItems: "center", marginBottom: 12, marginLeft: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", fontWeight: 700, color: "#e11d48", cursor: "pointer" }}>
            <input type="checkbox" name="issue" value="true" defaultChecked={showIssuesOnly} style={{ accentColor: "#e11d48", width: 16, height: 16 }} />
            🔴 노무 이슈 발생만 보기
          </label>
        </div>
        <button className="btn" type="submit" style={{ padding: "10px 22px", flexShrink: 0, height: 42, alignSelf: "flex-end" }}>
          조회
        </button>
      </form>

      {/* Table */}
      <div className="panel">
        <div className="panel-header">
          <h2>직원 목록 <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: "0.85rem" }}>({list.length}명)</span></h2>
        </div>
        <div className="table-wrap" style={{ borderRadius: 0, border: "none" }}>
          <table>
            <thead>
              <tr>
                <th>이름</th>
                <th>부서</th>
                <th>직책</th>
                <th>입사일</th>
                <th>재직상태</th>
                <th>요청 / 문서</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
              {list.map((e) => {
                const reqCount = getEmployeeRequests(tenant.id, e.id).length;
                const docs = getEmployeeDocuments(tenant.id, e.id);
                return (
                  <tr key={e.id}>
                    <td>
                      <Link href={`/portal/${tenant.slug}/people/${e.id}`} style={{
                        color: "#3730a3", fontWeight: 600, letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 6
                      }}>
                        {e.full_name}
                        {e.is_risk && (
                          <span style={{ background: "#fff1f2", color: "#e11d48", fontSize: "0.65rem", padding: "2px 6px", borderRadius: 4, fontWeight: 800 }}>
                            집중 관리
                          </span>
                        )}
                      </Link>
                    </td>
                    <td style={{ color: "#6b7280" }}>{e.department || "—"}</td>
                    <td style={{ color: "#6b7280" }}>{e.job_title || "—"}</td>
                    <td style={{ color: "#6b7280", fontVariantNumeric: "tabular-nums" }}>{formatDate(e.hire_date)}</td>
                    <td><StatusBadge status={e.employment_status} /></td>
                    <td style={{ color: "#9ca3af", fontSize: "0.82rem" }}>
                      요청 {reqCount}건 · 문서 {docs.length}건
                    </td>
                    <td>
                      <Link href={`/portal/${tenant.slug}/people/${e.id}`} style={{
                        fontSize: "0.78rem", color: "#6366f1", fontWeight: 600,
                      }}>
                        보기 →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </PortalShell>
  );
}
