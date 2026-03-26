"use client";

import { useCallback, useRef, useState } from "react";
import type { TaxFile } from "@/lib/server/portal-store";

interface Props {
  tenantSlug: string;
  onUploaded: (file: TaxFile) => void;
}

const CATEGORIES = [
  { value: "assets", label: "자산" },
  { value: "liabilities", label: "부채" },
  { value: "financial", label: "금융" },
  { value: "manual", label: "수기증빙" },
];

export function TaxUploadZone({ tenantSlug, onUploaded }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("manual");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setError("");
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("category", category);
        const res = await fetch(`/api/portal/${tenantSlug}/tax/files`, {
          method: "POST",
          body: fd,
        });
        if (!res.ok) {
          const data = await res.json() as { error?: string };
          throw new Error(data.error ?? "업로드 실패");
        }
        const data = await res.json() as { file: TaxFile };
        onUploaded(data.file);
      } catch (e) {
        setError(e instanceof Error ? e.message : "업로드 오류");
      } finally {
        setUploading(false);
      }
    },
    [tenantSlug, category, onUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      files.forEach(uploadFile);
    },
    [uploadFile]
  );

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.82rem", color: "var(--text-3)", fontWeight: 600 }}>카테고리</span>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            style={{
              padding: "5px 14px",
              borderRadius: 99,
              border: "1px solid",
              borderColor: category === c.value ? "var(--brand)" : "var(--border)",
              background: category === c.value ? "var(--brand-pale)" : "var(--surface)",
              color: category === c.value ? "var(--brand-mid)" : "var(--text-3)",
              fontWeight: 600,
              fontSize: "0.8rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: "2px dashed",
          borderColor: dragging ? "var(--brand)" : "var(--border)",
          borderRadius: 16,
          padding: "32px 24px",
          textAlign: "center",
          cursor: uploading ? "not-allowed" : "pointer",
          background: dragging
            ? "linear-gradient(180deg,rgba(0,222,103,0.06),rgba(0,222,103,0.02))"
            : "linear-gradient(180deg,#f8fdff 0%,#eef8ff 100%)",
          transition: "all 0.2s",
          opacity: uploading ? 0.7 : 1,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            Array.from(e.target.files ?? []).forEach(uploadFile);
            e.target.value = "";
          }}
        />
        <div style={{ fontSize: "2rem", marginBottom: 8 }}>📎</div>
        <strong style={{ display: "block", color: "var(--text-1)", fontSize: "0.95rem" }}>
          {uploading ? "업로드 중..." : "파일을 끌어다 놓거나 클릭하세요"}
        </strong>
        <p style={{ marginTop: 6, color: "var(--text-4)", fontSize: "0.8rem" }}>
          선택된 카테고리: <strong style={{ color: "var(--brand-mid)" }}>
            {CATEGORIES.find((c) => c.value === category)?.label}
          </strong>
          {" "}· PDF, Excel, 이미지 모두 가능
        </p>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--red-bg)", color: "var(--red)", fontSize: "0.82rem" }}>
          {error}
        </div>
      )}
    </div>
  );
}
