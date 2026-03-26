"use client";

import { useState } from "react";
import type { TaxFile } from "@/lib/server/portal-store";
import { TaxUploadZone } from "./TaxUploadZone";
import { TaxFileList } from "./TaxFileList";

interface Props {
  tenantSlug: string;
  initialFiles: TaxFile[];
  canReview: boolean;
}

export function TaxSection({ tenantSlug, initialFiles, canReview }: Props) {
  const [files, setFiles] = useState<TaxFile[]>(initialFiles);

  const handleUploaded = (newFile: TaxFile) => {
    setFiles((prev) => [newFile, ...prev]);
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <p style={{ fontSize: "0.82rem", color: "var(--text-3)", marginBottom: 16 }}>
          카테고리를 먼저 선택하고 파일을 끌어다 놓거나 클릭해서 업로드하세요.
        </p>
        <TaxUploadZone tenantSlug={tenantSlug} onUploaded={handleUploaded} />
      </div>
      <div>
        <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>
          업로드된 파일 ({files.length}건)
        </p>
        <TaxFileList tenantSlug={tenantSlug} initialFiles={files} canReview={canReview} />
      </div>
    </div>
  );
}
