"use client";

import { useState } from "react";
import type { ConsultingProject } from "@/lib/server/portal-store";

interface Props {
  tenantSlug: string;
  initialProjects: ConsultingProject[];
  canManage: boolean;
}

const STAGE_OPTIONS = [
  "자료수집 대기",
  "자료수집 중",
  "자료수집 완료",
  "검토 진행 중",
  "초안 검토중",
  "의뢰인 확인",
  "신고/제출 완료",
  "완료",
];

const STATUS_LABEL: Record<string, string> = {
  collecting: "자료수집",
  reviewing: "검토 중",
  completed: "완료",
};
const STATUS_TONE: Record<string, string> = {
  collecting: "warn",
  reviewing: "info",
  completed: "ok",
};

const EMPTY_FORM = {
  name: "",
  category: "세무 컨설팅",
  lead: "",
  progress: "0",
  stage: "자료수집 대기",
  description: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
};

export function ConsultingManager({ tenantSlug, initialProjects, canManage }: Props) {
  const [projects, setProjects] = useState<ConsultingProject[]>(initialProjects);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (proj: ConsultingProject) => {
    setForm({
      name: proj.name,
      category: proj.category,
      lead: proj.lead,
      progress: String(proj.progress),
      stage: proj.stage,
      description: proj.description,
      startDate: proj.startDate,
      endDate: proj.endDate ?? "",
    });
    setEditId(proj.id);
    setShowForm(true);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const url = editId
        ? `/api/portal/${tenantSlug}/consulting/${editId}`
        : `/api/portal/${tenantSlug}/consulting`;
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, progress: Number(form.progress) }),
      });
      if (res.ok) {
        const data = await res.json() as { project: ConsultingProject };
        if (editId) {
          setProjects((prev) => prev.map((p) => (p.id === editId ? data.project : p)));
        } else {
          setProjects((prev) => [...prev, data.project]);
        }
        setShowForm(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (id: string, progress: number, stage: string) => {
    const res = await fetch(`/api/portal/${tenantSlug}/consulting/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress, stage }),
    });
    if (res.ok) {
      const data = await res.json() as { project: ConsultingProject };
      setProjects((prev) => prev.map((p) => (p.id === id ? data.project : p)));
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("컨설팅 프로젝트를 삭제하시겠습니까?")) return;
    await fetch(`/api/portal/${tenantSlug}/consulting/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {canManage && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn" style={{ fontSize: "0.85rem", padding: "8px 18px" }} onClick={openAdd}>
            + 컨설팅 추가
          </button>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ border: "2px solid var(--brand-light)", padding: "20px 24px" }}>
          <h4 style={{ fontWeight: 700, marginBottom: 16 }}>{editId ? "컨설팅 수정" : "새 컨설팅 프로젝트"}</h4>
          <div className="grid grid-2" style={{ gap: 12, marginBottom: 12 }}>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>프로젝트명 *</span>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="사내근로복지기금 설계" />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>카테고리</span>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                <option>세무 컨설팅</option>
                <option>노무 컨설팅</option>
                <option>법인 설립</option>
                <option>기타</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>담당자</span>
              <input value={form.lead} onChange={(e) => setForm((f) => ({ ...f, lead: e.target.value }))} placeholder="이세무 / 김노무" />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>현재 단계</span>
              <select value={form.stage} onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))}>
                {STAGE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>진행률 ({form.progress}%)</span>
              <input type="range" min="0" max="100" step="5" value={form.progress}
                onChange={(e) => setForm((f) => ({ ...f, progress: e.target.value }))} />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>시작일</span>
              <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            </label>
          </div>
          <label style={{ display: "grid", gap: 4, marginBottom: 14 }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>프로젝트 설명</span>
            <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="컨설팅 목적 및 기대 효과" />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" disabled={loading} onClick={submit}>
              {loading ? "저장 중..." : (editId ? "수정 완료" : "등록")}
            </button>
            <button className="btn outline" onClick={() => setShowForm(false)}>취소</button>
          </div>
        </div>
      )}

      <div className="grid grid-3">
        {projects.map((proj) => (
          <section key={proj.id} className="panel">
            <div className="panel-header" style={{ cursor: "pointer" }} onClick={() => setExpandedId(expandedId === proj.id ? null : proj.id)}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                  <h2 style={{ fontSize: "0.92rem" }}>{proj.name}</h2>
                </div>
                <span className={`badge ${STATUS_TONE[proj.status]}`} style={{ fontSize: "0.72rem" }}>
                  {STATUS_LABEL[proj.status]}
                </span>
              </div>
              <span
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: proj.progress >= 80 ? "var(--green)" : proj.progress >= 50 ? "var(--brand)" : "var(--amber)",
                }}
              >
                {proj.progress}%
              </span>
            </div>
            <div className="panel-body" style={{ display: "grid", gap: 12 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.78rem", color: "var(--text-4)" }}>
                  <span>{proj.stage}</span>
                  <span>담당: {proj.lead}</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${proj.progress}%`,
                      height: "100%",
                      background: `linear-gradient(90deg,${proj.progress >= 80 ? "#10b981,#34d399" : proj.progress >= 50 ? "#0369a1,#38bdf8" : "#f59e0b,#fcd34d"})`,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>

              {expandedId === proj.id && (
                <div style={{ display: "grid", gap: 10 }}>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>{proj.description || "설명 없음"}</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-4)" }}>시작: {proj.startDate}</p>
                  {canManage && (
                    <div>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-3)", marginBottom: 8, fontWeight: 600 }}>단계 빠른 변경</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {STAGE_OPTIONS.map((s) => (
                          <button
                            key={s}
                            style={{
                              padding: "3px 10px",
                              borderRadius: 99,
                              border: "1px solid",
                              borderColor: proj.stage === s ? "var(--brand)" : "var(--border)",
                              background: proj.stage === s ? "var(--brand-pale)" : "var(--surface)",
                              color: proj.stage === s ? "var(--brand-mid)" : "var(--text-3)",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              const stageIdx = STAGE_OPTIONS.indexOf(s);
                              const autoProgress = Math.round((stageIdx / (STAGE_OPTIONS.length - 1)) * 100);
                              updateProgress(proj.id, autoProgress, s);
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {canManage && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn outline" style={{ fontSize: "0.78rem", padding: "5px 12px" }} onClick={() => openEdit(proj)}>수정</button>
                      <button className="btn outline" style={{ fontSize: "0.78rem", padding: "5px 12px", color: "var(--red)" }} onClick={() => deleteProject(proj.id)}>삭제</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 32, color: "var(--text-4)" }}>
          등록된 컨설팅 프로젝트가 없습니다.
        </div>
      )}
    </div>
  );
}
