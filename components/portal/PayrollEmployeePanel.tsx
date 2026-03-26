"use client";

import { useState } from "react";
import type { PortalEmployee } from "@/lib/server/portal-store";

interface Props {
  tenantSlug: string;
  initialEmployees: PortalEmployee[];
}

const EMP_TYPE_LABEL: Record<string, string> = {
  regular: "상용",
  part_time: "단시간",
  freelance: "프리랜서",
  daily: "일용",
};

const EMPTY_FORM = {
  name: "",
  employmentType: "regular",
  baseSalary: "",
  joinedAt: "",
  leftAt: "",
  position: "",
  department: "",
  dependents: "-",
  note: "",
};

type FormData = typeof EMPTY_FORM;

export function PayrollEmployeePanel({ tenantSlug, initialEmployees }: Props) {
  const [employees, setEmployees] = useState<PortalEmployee[]>(initialEmployees);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (emp: PortalEmployee) => {
    setForm({
      name: emp.name,
      employmentType: emp.employmentType,
      baseSalary: String(emp.baseSalary),
      joinedAt: emp.joinedAt,
      leftAt: emp.leftAt ?? "",
      position: emp.position ?? "",
      department: emp.department ?? "",
      dependents: emp.dependents,
      note: emp.note ?? "",
    });
    setEditId(emp.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.joinedAt) {
      setError("이름과 입사일은 필수입니다.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const url = editId
        ? `/api/portal/${tenantSlug}/payroll/employees/${editId}`
        : `/api/portal/${tenantSlug}/payroll/employees`;
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, baseSalary: Number(form.baseSalary) || 0 }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "저장 실패");
      }
      const data = await res.json() as { employee: PortalEmployee };
      if (editId) {
        setEmployees((prev) => prev.map((e) => (e.id === editId ? data.employee : e)));
      } else {
        setEmployees((prev) => [...prev, data.employee]);
      }
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류");
    } finally {
      setLoading(false);
    }
  };

  const deleteEmployee = async (id: string) => {
    if (!confirm("사원을 삭제하시겠습니까?")) return;
    await fetch(`/api/portal/${tenantSlug}/payroll/employees/${id}`, { method: "DELETE" });
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "0.95rem" }}>사원 목록 ({employees.filter(e => e.status === "active").length}명 재직 중)</h3>
        <button className="btn" style={{ fontSize: "0.82rem", padding: "7px 16px" }} onClick={openAdd}>
          + 사원 등록
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 16, padding: "20px 24px", border: "2px solid var(--brand-light)" }}>
          <h4 style={{ fontWeight: 700, marginBottom: 16, color: "var(--text-1)" }}>
            {editId ? "사원 정보 수정" : "신규 사원 등록"}
          </h4>
          <div className="grid grid-3" style={{ marginBottom: 12 }}>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>이름 *</span>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="홍길동" />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>근로형태</span>
              <select value={form.employmentType} onChange={(e) => setForm((f) => ({ ...f, employmentType: e.target.value }))}>
                <option value="regular">상용</option>
                <option value="part_time">단시간</option>
                <option value="freelance">프리랜서</option>
                <option value="daily">일용</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>보수월액</span>
              <input type="number" value={form.baseSalary} onChange={(e) => setForm((f) => ({ ...f, baseSalary: e.target.value }))} placeholder="3000000" />
            </label>
          </div>
          <div className="grid grid-2" style={{ marginBottom: 12 }}>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>입사일 *</span>
              <input type="date" value={form.joinedAt} onChange={(e) => setForm((f) => ({ ...f, joinedAt: e.target.value }))} />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>퇴사일 (퇴사자만)</span>
              <input type="date" value={form.leftAt} onChange={(e) => setForm((f) => ({ ...f, leftAt: e.target.value }))} />
            </label>
          </div>
          <div className="grid grid-3" style={{ marginBottom: 12 }}>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>직위/직책</span>
              <input value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} placeholder="팀장" />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>부서</span>
              <input value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} placeholder="영업팀" />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>부양가족</span>
              <input value={form.dependents} onChange={(e) => setForm((f) => ({ ...f, dependents: e.target.value }))} placeholder="배우자 1 / 자녀 2" />
            </label>
          </div>
          <label style={{ display: "grid", gap: 4, marginBottom: 14 }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>특이사항</span>
            <input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="예: 두루누리 적용대상, 산재 적용 제외 등" />
          </label>

          {error && (
            <div style={{ marginBottom: 12, padding: "8px 12px", borderRadius: 8, background: "var(--red-bg)", color: "var(--red)", fontSize: "0.82rem" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" disabled={loading} onClick={handleSubmit}>
              {loading ? "저장 중..." : (editId ? "수정 완료" : "등록")}
            </button>
            <button className="btn outline" onClick={() => setShowForm(false)}>취소</button>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>성명</th>
              <th>근로형태</th>
              <th>직위</th>
              <th>부서</th>
              <th>보수월액</th>
              <th>입사일</th>
              <th>부양가족</th>
              <th>상태</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td><strong>{emp.name}</strong></td>
                <td>{EMP_TYPE_LABEL[emp.employmentType] ?? emp.employmentType}</td>
                <td>{emp.position ?? "-"}</td>
                <td>{emp.department ?? "-"}</td>
                <td>{emp.baseSalary.toLocaleString()}원</td>
                <td>{emp.joinedAt}</td>
                <td>{emp.dependents}</td>
                <td>
                  <span className={`badge ${emp.status === "active" ? "ok" : "warn"}`}>
                    {emp.status === "active" ? "재직" : "퇴직"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      className="btn outline"
                      style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                      onClick={() => openEdit(emp)}
                    >
                      수정
                    </button>
                    <button
                      className="btn outline"
                      style={{ padding: "4px 10px", fontSize: "0.75rem", color: "var(--red)" }}
                      onClick={() => deleteEmployee(emp.id)}
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
