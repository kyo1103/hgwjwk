"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={className}
      aria-label={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
      title={theme === "light" ? "다크 모드" : "라이트 모드"}
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        border: "1px solid rgba(128,128,128,0.3)",
        background: theme === "light" ? "#f1f5f9" : "#334155",
        color: theme === "light" ? "#334155" : "#fbbf24",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        transition: "all 0.25s ease",
      }}
    >
      {theme === "light" ? "\u{1F319}" : "\u{2600}\u{FE0F}"}
    </button>
  );
}
