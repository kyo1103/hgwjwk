"use client";

import { useState } from "react";
import type { InsightPost } from "@/lib/server/portal-store";

interface Props {
  initialPosts: InsightPost[];
  canWrite: boolean;
}

const CATEGORY_COLOR: Record<string, string> = {
  "세무 칼럼": "#0369a1",
  "노무 코멘트": "#7c3aed",
  "지원금 안내": "#059669",
  "개정사항": "#dc2626",
};

const EMPTY_FORM = {
  category: "세무 칼럼",
  title: "",
  content: "",
  summary: "",
  audience: "전체 공지",
  targetIndustry: "",
  isDraft: false,
};
type InsightForm = typeof EMPTY_FORM;

export function InsightManager({ initialPosts, canWrite }: Props) {
  const [posts, setPosts] = useState<InsightPost[]>(initialPosts);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<InsightForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (post: InsightPost) => {
    setForm({
      category: post.category,
      title: post.title,
      content: post.content,
      summary: post.summary,
      audience: post.audience,
      targetIndustry: post.targetIndustry ?? "",
      isDraft: post.isDraft,
    });
    setEditId(post.id);
    setShowForm(true);
  };

  const submit = async (asDraft = false) => {
    setLoading(true);
    try {
      const payload = { ...form, isDraft: asDraft };
      const url = editId ? `/api/portal/insights/${editId}` : `/api/portal/insights`;
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json() as { post: InsightPost };
        if (editId) {
          setPosts((prev) => prev.map((p) => (p.id === editId ? data.post : p)));
        } else {
          setPosts((prev) => [data.post, ...prev]);
        }
        setShowForm(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm("포스트를 삭제하시겠습니까?")) return;
    await fetch(`/api/portal/insights/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {canWrite && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn" style={{ fontSize: "0.85rem", padding: "8px 18px" }} onClick={openAdd}>
            + 콘텐츠 작성
          </button>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ border: "2px solid var(--brand-light)", padding: "20px 24px" }}>
          <h4 style={{ fontWeight: 700, marginBottom: 16 }}>{editId ? "콘텐츠 수정" : "새 콘텐츠 작성"}</h4>
          <div className="grid grid-2" style={{ gap: 12, marginBottom: 12 }}>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>카테고리</span>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                <option>세무 칼럼</option>
                <option>노무 코멘트</option>
                <option>지원금 안내</option>
                <option>개정사항</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>공개 범위</span>
              <select value={form.audience} onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}>
                <option>전체 공지</option>
                <option>업종 맞춤</option>
                <option>특정 고객사</option>
              </select>
            </label>
          </div>
          <label style={{ display: "grid", gap: 4, marginBottom: 12 }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>제목 *</span>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="제목을 입력하세요" />
          </label>
          <label style={{ display: "grid", gap: 4, marginBottom: 12 }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>요약 (목록에 표시)</span>
            <input value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} placeholder="한 줄 요약" />
          </label>
          <label style={{ display: "grid", gap: 4, marginBottom: 14 }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 600 }}>본문</span>
            <textarea rows={6} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="상세 내용을 입력하세요..." style={{ resize: "vertical" }} />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" disabled={loading || !form.title} onClick={() => submit(false)}>
              {loading ? "저장 중..." : "발행"}
            </button>
            <button className="btn outline" disabled={loading} onClick={() => submit(true)}>
              임시저장
            </button>
            <button className="btn outline" onClick={() => setShowForm(false)}>취소</button>
          </div>
        </div>
      )}

      {/* 포스트 목록 */}
      <div className="grid grid-3">
        {posts.map((post) => (
          <div key={post.id} className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <span
                style={{
                  padding: "2px 10px",
                  borderRadius: 99,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  background: `${CATEGORY_COLOR[post.category] ?? "#64748b"}18`,
                  color: CATEGORY_COLOR[post.category] ?? "var(--text-3)",
                }}
              >
                {post.category}
              </span>
              {post.isDraft && (
                <span className="badge warn" style={{ fontSize: "0.68rem" }}>임시저장</span>
              )}
            </div>
            <strong
              style={{ fontSize: "0.92rem", color: "var(--text-1)", cursor: "pointer", lineHeight: 1.4 }}
              onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}
            >
              {post.title}
            </strong>
            <p style={{ fontSize: "0.8rem", color: "var(--text-3)", lineHeight: 1.5 }}>
              {post.summary || post.content.slice(0, 60)}
            </p>

            {expandedId === post.id && (
              <div style={{ padding: "12px 0", borderTop: "1px solid var(--border-2)" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{post.content}</p>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-4)" }}>
                {post.authorName} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("ko-KR") : "미발행"}
              </span>
              <span
                style={{
                  fontSize: "0.72rem",
                  padding: "2px 8px",
                  borderRadius: 99,
                  background: post.audience === "전체 공지" ? "var(--blue-bg)" : "var(--amber-bg)",
                  color: post.audience === "전체 공지" ? "var(--blue)" : "var(--amber)",
                  fontWeight: 600,
                }}
              >
                {post.audience}
              </span>
            </div>

            {canWrite && (
              <div style={{ display: "flex", gap: 6, borderTop: "1px solid var(--border-2)", paddingTop: 10 }}>
                <button className="btn outline" style={{ fontSize: "0.75rem", padding: "4px 10px", flex: 1 }} onClick={() => openEdit(post)}>
                  수정
                </button>
                <button className="btn outline" style={{ fontSize: "0.75rem", padding: "4px 10px", color: "var(--red)" }} onClick={() => deletePost(post.id)}>
                  삭제
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {posts.length === 0 && !showForm && (
        <div className="card" style={{ textAlign: "center", padding: 32, color: "var(--text-4)" }}>
          게시된 콘텐츠가 없습니다.
        </div>
      )}
    </div>
  );
}
