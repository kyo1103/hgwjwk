import { InternalShell } from "@/components/InternalShell";
import { taskTemplates } from "@/lib/data";

export default function TemplatesPage() {
  return (
    <InternalShell active="업무 템플릿">
      <section className="main-card">
        <h2>업무 템플릿 관리</h2>
        <p className="muted">
          요청 유형별 자동 체크리스트를 정의하고, 담당자 기본 배정/마감일 기준(D+n)을 관리합니다.
        </p>
        <table>
          <thead>
            <tr>
              <th>템플릿명</th>
              <th>유형</th>
              <th>기본 담당</th>
              <th>업무 항목 수</th>
              <th>구성</th>
            </tr>
          </thead>
          <tbody>
            {taskTemplates.map((tpl) => (
              <tr key={tpl.id}>
                <td>{tpl.name}</td>
                <td>{tpl.requestType}</td>
                <td>{tpl.defaultAssignee}</td>
                <td>{tpl.taskCount}</td>
                <td>{tpl.taskTemplates.map((t) => t.title).join(", ")}</td>
                <td>
                  <button className="btn secondary">수정</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </InternalShell>
  );
}
