"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./LoginScreen.module.css";
export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [clientRole, setClientRole] = useState<"owner" | "hr">("owner");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, allowAdmin: adminMode }),
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
      <div className={styles.shell}>
        <section className={styles.splitVisual}>
          <div className={styles.brandBar}>
            <strong className={styles.brandName}>hgwjwk</strong>
            <span className={styles.brandTag}>Tax & Labor Workspace</span>
          </div>

          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>세무사·노무사를 위한 스마트 업무 솔루션</p>
            <h1 className={styles.heroHeadline}>
              세무사·노무사가
              <br />
              직접 만든 ERP
            </h1>
            <p className={styles.heroSubtext}>
              복잡한 실무를 더 쉽게 관리할 수 있습니다.
            </p>
          </div>

          <div className={styles.metricRow}>
            <article className={styles.metricCard}>
              <strong>세금 신고 관리</strong>
              <span>고객사 서류와 신고 일정을 한 곳에서</span>
            </article>
            <article className={styles.metricCard}>
              <strong>급여·노무 관리</strong>
              <span>근태·급여 변경 내역을 한 눈에</span>
            </article>
          </div>
        </section>

        <section className={styles.splitLogin}>
          <div className={styles.topTabs}>
            <button type="button" className={styles.activeTab}>
              {adminMode ? "고객사 로그인" : "로그인"}
            </button>
            <a className={styles.downloadTab} href="/hgwjwk-proposal.txt" download>
              제안서 다운로드
            </a>
            {adminMode ? (
              <button
                type="button"
                className={styles.adminTab}
                onClick={() => {
                  setError("");
                  setEmail("");
                  setPassword("");
                }}
              >
                관리자 로그인
              </button>
            ) : null}
          </div>

          <div className={styles.loginHeader}>
            <h2 className={styles.loginTitle}>{adminMode ? "관리자 로그인" : "고객사 로그인"}</h2>
            <p className={styles.loginSubtext}>
              {adminMode ? "관리자 계정으로 로그인합니다." : "이메일과 비밀번호를 입력해 주세요."}
            </p>
          </div>

          {!adminMode ? (
            <div className={styles.roleToggle}>
              <button
                type="button"
                className={`${styles.roleButton} ${clientRole === "owner" ? styles.roleButtonActive : ""}`}
                onClick={() => setClientRole("owner")}
              >
                대표
              </button>
              <button
                type="button"
                className={`${styles.roleButton} ${clientRole === "hr" ? styles.roleButtonActive : ""}`}
                onClick={() => setClientRole("hr")}
              >
                인사담당자
              </button>
            </div>
          ) : null}

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
                  placeholder="비밀번호 입력"
                />
              </label>
            </div>

            {error ? (
              <div className={styles.flashBanner}>{error}</div>
            ) : null}

            <div className={styles.optionRow}>
              <label className={styles.checkItem}>
                <input type="checkbox" defaultChecked />
                <span>로그인 유지</span>
              </label>
              <label className={styles.checkItem}>
                <input type="checkbox" />
                <span>이메일 저장</span>
              </label>
            </div>

            <button className={styles.primaryButton} type="submit" disabled={isSubmitting}>
              {isSubmitting ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className={styles.helperLinks}>
            <button type="button">비밀번호 찾기</button>
            <button type="button">이메일 찾기</button>
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        <p>
          부산 동래구 미남로 148 (온천동) 6층 세무법인 가온택스 / 대표세무사: 허건우
        </p>
        <p>
          울산 남구 문수로 392번길 3 (신정동) 207호 신정노동법률사무소 / 대표노무사: 장원교 /
        </p>
        <p className={styles.footerSpacer} />
        <p>
          Copyright{" "}
          <button
            type="button"
            className={styles.hiddenAdminTrigger}
            onClick={() => {
              setAdminMode((current) => !current);
              setError("");
              setEmail("");
              setPassword("");
            }}
            aria-label="관리자 로그인 전환"
          >
            ©
          </button>
          {" "}Labor&amp;Tax Corporation. All right reserve
        </p>
      </footer>
    </div>
  );
}
