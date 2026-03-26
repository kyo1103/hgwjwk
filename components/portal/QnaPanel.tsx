"use client";

import { useState } from "react";
import type { QnaItem } from "@/lib/server/portal-store";

interface Props {
  tenantSlug: string;
  initialItems: QnaItem[];
  canAnswer: boolean;
}

const STATUS_TONE: Record<string, string> = {
  답변대기: "warn",
  답변중: "info",
  완료: "ok",
};

export function QnaPanel({ tenantSlug, initialItems, canAnswer }: Props) {
  const [items, setItems] = useState<QnaItem[]>(initialItems);
  const [newQ, setNewQ] = useState("");
  const [posting, setPosting] = useState(false);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const submitQuestion = async () => {
    if (!newQ.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/portal/${tenantSlug}/qna`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQ }),
      });
      if (res.ok) {
        const data = await res.json() as { item: QnaItem };
        setItems((prev) => [data.item, ...prev]);
        setNewQ("");
      }
    } finally {
      setPosting(false);
    }
  };

  const submitAnswer = async (id: string) => {
    if (!answerText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/${tenantSlug}/qna/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: answerText }),
      });
      if (res.ok) {
        const data = await res.json() as { item: QnaItem };
        setItems((prev) => prev.map((q) => (q.id === id ? data.item : q)));
        setAnsweringId(null);
        setAnswerText("");
      }
    } finally {
      setLoading(false);
    }
  };

  const setStatus = async (id: string, status: QnaItem["status"]) => {
    const res = await fetch(`/api/portal/${tenantSlug}/qna/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json() as { item: QnaItem };
      setItems((prev) => prev.map((q) => (q.id === id ? data.item : q)));
    }
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* 질문 등록 폼 */}
      <section className="panel">
        <div className="panel-header">
          <h2>질문 등록</h2>
          <span className="badge ok">챗봇 + 전문가 인계</span>
        </div>
        <div className="panel-body" style={{ display: "grid", gap: 12 }}>
          <textarea
            value={newQ}
            onChange={(e) => setNewQ(e.target.value)}
            rows={3}
            placeholder="세무·노무 관련 궁금한 사항을 입력해 주세요. 단순 안내는 빠르게, 전문 판단이 필요한 건은 담당자에게 연결됩니다."
            style={{ resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn" disabled={posting || !newQ.trim()} onClick={submitQuestion}>
              {posting ? "등록 중..." : "질문 등록"}
            </button>
            <span style={{ fontSize: "0.78rem", color: "var(--text-4)" }}>
              영업일 기준 1~2일 내 전문가 답변
            </span>
          </div>
        </div>
      </section>

      {/* Q&A 목록 */}
      <div style={{ display: "grid", gap: 12 }}>
        {items.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 32, color: "var(--text-4)" }}>
            등록된 질문이 없습니다.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              {/* 질문 헤더 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "18px 22px",
                  cursor: "pointer",
                  flexWrap: "wrap",
                }}
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                    <span className={`badge ${STATUS_TONE[item.status]}`}>{item.status}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-4)" }}>{item.askerName} · {new Date(item.createdAt).toLocaleDateString("ko-KR")}</span>
                  </div>
                  <strong style={{ fontSize: "0.92rem", color: "var(--text-1)" }}>{item.question}</strong>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-4)" }}>{expandedId === item.id ? "▲" : "▼"}</span>
              </div>

              {/* 답변 영역 */}
              {expandedId === item.id && (
                <div style={{ borderTop: "1px solid var(--border-2)", padding: "16px 22px", background: "var(--surface-2)" }}>
                  {item.answer ? (
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--brand-mid)" }}>전문가 답변</span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-4)" }}>{item.answeredBy} · {item.answeredAt ? new Date(item.answeredAt).toLocaleDateString("ko-KR") : ""}</span>
                      </div>
                      <p style={{ fontSize: "0.88rem", color: "var(--text-2)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{item.answer}</p>
                    </div>
                  ) : (
                    <p style={{ color: "var(--text-4)", fontSize: "0.85rem" }}>아직 답변이 등록되지 않았습니다.</p>
                  )}

                  {canAnswer && (
                    <div style={{ marginTop: 14 }}>
                      {answeringId === item.id ? (
                        <div style={{ display: "grid", gap: 10 }}>
                          <textarea
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            rows={3}
                            placeholder="전문가 답변을 입력하세요..."
                          />
                          <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn" style={{ fontSize: "0.82rem", padding: "7px 14px" }} disabled={loading} onClick={() => submitAnswer(item.id)}>
                              {loading ? "저장 중..." : "답변 등록"}
                            </button>
                            <button className="btn outline" style={{ fontSize: "0.82rem", padding: "7px 14px" }} onClick={() => setAnsweringId(null)}>취소</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="btn outline"
                            style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                            onClick={() => { setAnsweringId(item.id); setAnswerText(item.answer ?? ""); }}
                          >
                            {item.answer ? "답변 수정" : "답변 등록"}
                          </button>
                          {item.status !== "답변중" && item.status !== "완료" && (
                            <button className="btn outline" style={{ fontSize: "0.8rem", padding: "6px 12px" }} onClick={() => setStatus(item.id, "답변중")}>
                              답변 중으로 변경
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
