"use client";

import { useState } from "react";
import styles from "./CopyPageButton.module.css";

type Props = {
  label: string;
  targetSelector?: string;
  className?: string;
};

export default function CopyPageButton({ label, targetSelector = "[data-copy-root]", className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const target = document.querySelector(targetSelector);
    const bodyText = target instanceof HTMLElement ? target.innerText.trim() : document.body.innerText.trim();
    const payload = `${label}\n\n${bodyText}`.trim();

    await navigator.clipboard.writeText(payload);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button type="button" className={`${styles.copyButton} ${className}`.trim()} onClick={() => void handleCopy()}>
      {copied ? "복사 완료" : "복사"}
    </button>
  );
}
