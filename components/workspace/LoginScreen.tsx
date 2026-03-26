"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./workspace.module.css";
import { workspaceDemoAccounts } from "@/lib/workspace-users";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "이메일 또는 비밀번호가 일치하지 않습니다.");
      }

      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "인증 서버에 연결할 수 없습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.loginRoot}>
      <div className={styles.splitCard}>
        {/* Left Hand Side: Enterprise Branding & Marketing */}
        <div className={styles.splitVisual}>
          <div className={styles.splitBrand}>
            <strong>가온텍스 × 신정 노무</strong>
            <span>Hyper Workspace</span>
          </div>

          <h1 className={styles.heroHeadline}>
            복잡한 기업 실무, <br />
            <span>가장 완벽한 자동화.</span>
          </h1>
          <p className={styles.heroSubtext}>
            세무와 노무 오퍼레이션을 하나의 통합된 환경에서 관리하세요. 최고의 보안과 타협 없는 완성도를 제공합니다.
          </p>
        </div>

        {/* Right Hand Side: Admin Login Form */}
        <div className={styles.splitLogin}>
          <div className={styles.loginHeader}>
            <h2 className={styles.loginTitle}>워크스페이스 접속</h2>
            <p className={styles.loginSubtext}>
              테스트 계정을 선택하거나 자격 증명을 입력하세요.
            </p>
          </div>

          <div className={styles.accountList}>
            {workspaceDemoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                className={styles.accountButton}
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                  setError("");
                }}
              >
                <div className={styles.accountButtonLeft}>
                  <strong>{account.roleLabel}</strong>
                  <span>{account.name}</span>
                </div>
                <span className={styles.accountScope}>
                  {account.scope === "admin" ? "최고 관리자" : "고객사"}
                </span>
              </button>
            ))}
          </div>

          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.fieldGrid}>
              <label className={styles.field}>
                <span>이메일 주소</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@company.com"
                />
              </label>

              <label className={styles.field}>
                <span>비밀번호</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="*********"
                />
              </label>
            </div>

            {error ? (
              <div className={styles.flashBanner}>{error}</div>
            ) : null}

            <button className={styles.primaryButton} type="submit" disabled={isSubmitting}>
              {isSubmitting ? "인증 중..." : "안전하게 계속하기"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
