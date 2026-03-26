"use client";

import { useState } from "react";
import type { TaxPaymentRecord } from "@/lib/server/portal-store";

interface Props {
  tenantSlug: string;
  initialPayments: TaxPaymentRecord[];
  canSend: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "송부 전",
  notice_sent: "송부 완료",
  paid: "납부 완료",
  overdue: "기한 초과",
};
const STATUS_TONE: Record<string, string> = {
  pending: "warn",
  notice_sent: "info",
  paid: "ok",
  overdue: "err",
};

export function TaxPaymentPanel({ tenantSlug, initialPayments, canSend }: Props) {
  const [payments, setPayments] = useState<TaxPaymentRecord[]>(initialPayments);
  const [editing, setEditing] = useState<string | null>(null);
  const [memoText, setMemoText] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const startEdit = (p: TaxPaymentRecord) => {
    setEditing(p.id);
    setMemoText(p.sendMemo);
  };

  const saveMemo = async (id: string) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/portal/${tenantSlug}/tax/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendMemo: memoText }),
      });
      if (res.ok) {
        const data = await res.json() as { payment: TaxPaymentRecord };
        setPayments((prev) => prev.map((p) => (p.id === id ? data.payment : p)));
        setEditing(null);
      }
    } finally {
      setLoading(null);
    }
  };

  const sendPayment = async (id: string) => {
    setLoading(id);
    setShowConfirm(null);
    try {
      const res = await fetch(`/api/portal/${tenantSlug}/tax/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send" }),
      });
      if (res.ok) {
        const data = await res.json() as { payment: TaxPaymentRecord };
        setPayments((prev) => prev.map((p) => (p.id === id ? data.payment : p)));
      }
    } finally {
      setLoading(null);
    }
  };

  const markPaid = async (id: string) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/portal/${tenantSlug}/tax/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });
      if (res.ok) {
        const data = await res.json() as { payment: TaxPaymentRecord };
        setPayments((prev) => prev.map((p) => (p.id === id ? data.payment : p)));
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {payments.map((p) => (
        <div key={p.id} className="card" style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <strong style={{ fontSize: "1rem" }}>{p.taxType}</strong>
              <span className={`badge ${STATUS_TONE[p.status] ?? ""}`}>{STATUS_LABEL[p.status]}</span>
            </div>
            <span style={{ fontSize: "0.82rem", color: "var(--text-4)" }}>납부기한: {p.dueDate}</span>
          </div>

          {editing === p.id ? (
            <div style={{ display: "grid", gap: 10 }}>
              <textarea
                value={memoText}
                onChange={(e) => setMemoText(e.target.value)}
                rows={3}
                style={{ resize: "vertical" }}
                placeholder="고객사에 전달할 송부 메모를 작성하세요..."
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn"
                  style={{ fontSize: "0.82rem", padding: "7px 14px" }}
                  disabled={loading === p.id}
                  onClick={() => saveMemo(p.id)}
                >
                  저장
                </button>
                <button
                  className="btn outline"
                  style={{ fontSize: "0.82rem", padding: "7px 14px" }}
                  onClick={() => setEditing(null)}
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--surface-2)", fontSize: "0.85rem", color: "var(--text-2)", marginBottom: 12 }}>
              {p.sendMemo || <span style={{ color: "var(--text-4)" }}>송부 메모 없음</span>}
            </div>
          )}

          {p.sentAt && (
            <p style={{ fontSize: "0.78rem", color: "var(--text-4)", marginBottom: 10 }}>
              송부: {new Date(p.sentAt).toLocaleDateString("ko-KR")} · {p.sentBy}
            </p>
          )}

          {canSend && editing !== p.id && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                className="btn outline"
                style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                onClick={() => startEdit(p)}
              >
                메모 수정
              </button>
              {p.status === "pending" && (
                showConfirm === p.id ? (
                  <>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-3)", alignSelf: "center" }}>정말 송부하시겠습니까?</span>
                    <button
                      className="btn"
                      style={{ fontSize: "0.8rem", padding: "6px 14px" }}
                      disabled={loading === p.id}
                      onClick={() => sendPayment(p.id)}
                    >
                      확인 후 송부
                    </button>
                    <button
                      className="btn outline"
                      style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                      onClick={() => setShowConfirm(null)}
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <button
                    className="btn"
                    style={{ fontSize: "0.8rem", padding: "6px 14px" }}
                    onClick={() => setShowConfirm(p.id)}
                  >
                    납부서 송부
                  </button>
                )
              )}
              {p.status === "notice_sent" && (
                <button
                  className="btn"
                  style={{ fontSize: "0.8rem", padding: "6px 14px", background: "var(--green)" }}
                  disabled={loading === p.id}
                  onClick={() => markPaid(p.id)}
                >
                  납부 완료 처리
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
