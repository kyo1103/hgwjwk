"use client";

import { useState } from "react";
import type { TaxFile } from "@/lib/server/portal-store";

interface Props {
  tenantSlug: string;
  initialFiles: TaxFile[];
  canReview: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "검토 대기",
  reviewing: "열람 중",
  done: "확인 완료",
};
const STATUS_TONE: Record<string, string> = {
  pending: "warn",
  reviewing: "info",
  done: "ok",
};
const CATEGORY_LABEL: Record<string, string> = {
  assets: "자산",
  liabilities: "부채",
  financial: "금융",
  manual: "수기증빙",
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function TaxFileList({ tenantSlug, initialFiles, canReview }: Props) {
  const [files, setFiles] = useState<TaxFile[]>(initialFiles);
  const [loading, setLoading] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>("all");

  const updateReview = async (fileId: string, status: TaxFile["reviewStatus"]) => {
    setLoading(fileId);
    try {
      const res = await fetch(`/api/portal/${tenantSlug}/tax/files/${fileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewStatus: status }),
      });
      if (res.ok) {
        const data = await res.json() as { file: TaxFile };
        setFiles((prev) => prev.map((f) => (f.id === fileId ? data.file : f)));
      }
    } finally {
      setLoading(null);
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm("파일을 삭제하시겠습니까?")) return;
    setLoading(fileId);
    try {
      await fetch(`/api/portal/${tenantSlug}/tax/files/${fileId}`, { method: "DELETE" });
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } finally {
      setLoading(null);
    }
  };

  const cats = ["all", ...Array.from(new Set(files.map((f) => f.category)))];
  const filtered = filterCat === "all" ? files : files.filter((f) => f.category === filterCat);

  if (files.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 32, color: "var(--text-4)" }}>
        업로드된 파일이 없습니다. 위 업로드 존으로 파일을 추가해 주세요.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            style={{
              padding: "4px 12px",
              borderRadius: 99,
              border: "1px solid",
              borderColor: filterCat === c ? "var(--brand)" : "var(--border)",
              background: filterCat === c ? "var(--brand-pale)" : "var(--surface)",
              color: filterCat === c ? "var(--brand-mid)" : "var(--text-3)",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {c === "all" ? `전체 (${files.length})` : `${CATEGORY_LABEL[c] ?? c}`}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {filtered.map((file) => (
          <div
            key={file.id}
            className="card"
            style={{ padding: "16px 20px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                <span
                  className={`badge ${STATUS_TONE[file.reviewStatus] ?? ""}`}
                  style={{ fontSize: "0.72rem" }}
                >
                  {STATUS_LABEL[file.reviewStatus]}
                </span>
                <span className="badge" style={{ fontSize: "0.72rem" }}>
                  {CATEGORY_LABEL[file.category] ?? file.category}
                </span>
              </div>
              <strong style={{ display: "block", fontSize: "0.9rem", color: "var(--text-1)" }}>
                {file.originalName}
              </strong>
              <p style={{ marginTop: 3, fontSize: "0.78rem", color: "var(--text-4)" }}>
                {formatSize(file.fileSize)} · {file.uploadedBy} · {new Date(file.uploadedAt).toLocaleDateString("ko-KR")}
                {file.reviewedBy ? ` · 검토: ${file.reviewedBy}` : ""}
              </p>
            </div>

            {canReview && (
              <div style={{ display: "flex", gap: 6 }}>
                {file.reviewStatus !== "reviewing" && (
                  <button
                    className="btn outline"
                    style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                    disabled={loading === file.id}
                    onClick={() => updateReview(file.id, "reviewing")}
                  >
                    열람 중
                  </button>
                )}
                {file.reviewStatus !== "done" && (
                  <button
                    className="btn"
                    style={{ padding: "6px 12px", fontSize: "0.78rem", background: "var(--green)" }}
                    disabled={loading === file.id}
                    onClick={() => updateReview(file.id, "done")}
                  >
                    확인 완료
                  </button>
                )}
                <button
                  className="btn outline"
                  style={{ padding: "6px 12px", fontSize: "0.78rem", color: "var(--red)", borderColor: "var(--red)" }}
                  disabled={loading === file.id}
                  onClick={() => deleteFile(file.id)}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
