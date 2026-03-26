"use client";

import type { PayrollRevision } from "@/lib/server/portal-store";

interface Props {
  revisions: PayrollRevision[];
}

export function PayrollRevisionList({ revisions }: Props) {
  if (revisions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 24, color: "var(--text-4)", fontSize: "0.85rem" }}>
        수정 이력이 없습니다.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {revisions.map((rev) => (
        <div
          key={rev.id}
          style={{
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
            padding: "12px 0",
            borderBottom: "1px solid var(--border-2)",
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--brand)",
              marginTop: 7,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <strong style={{ fontSize: "0.9rem", color: "var(--text-1)" }}>{rev.description}</strong>
              <span
                style={{
                  fontSize: "0.72rem",
                  padding: "2px 8px",
                  borderRadius: 99,
                  background: rev.visibility === "고객사 표시" ? "var(--green-bg)" : "var(--amber-bg)",
                  color: rev.visibility === "고객사 표시" ? "var(--green)" : "var(--amber)",
                  fontWeight: 600,
                }}
              >
                {rev.visibility}
              </span>
            </div>
            <p style={{ marginTop: 4, fontSize: "0.78rem", color: "var(--text-4)" }}>
              {rev.yearMonth} · {rev.changedBy} ({rev.changedByRole}) ·{" "}
              {new Date(rev.createdAt).toLocaleDateString("ko-KR")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
