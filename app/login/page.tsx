"use client";

import React, { useState } from "react";
import styles from "./login.module.css";
import Link from "next/link";

export default function LoginPage() {
  const [role, setRole] = useState("ceo");

  return (
    <div className={styles.pageContainer}>
      {/* Left Section - Clean & Light Branding */}
      <div className={styles.leftSection}>
        <div className={styles.brandNav}>
          <Link href="/" className={styles.logoText}>세무회계 인사노무 올인원</Link>
          <span className={styles.workspacePill}>Tax & Labor Workspace</span>
        </div>

        <div className={styles.textContent}>
          <h1 className={styles.mainTitle}>
            <span className={styles.titleLine1}>세무사·노무사가</span>
            <span className={styles.titleLine2}>직접 만든 <span className={styles.gradientText}>ERP</span></span>
          </h1>
          <p className={styles.grayDesc}>
            복잡한 실무를 더 쉽게 관리할 수 있습니다.
          </p>

          <button className={styles.proposalBtn}>
            제안서 다운로드
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>

          <div className={styles.infoCards}>
            <div className={styles.infoCard}>
              <svg className={styles.cardIcon} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path>
              </svg>
              <span className={styles.cardTitle}>세금 신고 관리</span>
              <p className={styles.cardDesc}>
                고객사 서류와 신고 일정을 한 곳에서 빠짐없이.
              </p>
            </div>
            <div className={styles.infoCard}>
              <svg className={styles.cardIcon} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              <span className={styles.cardTitle}>급여·노무 관리</span>
              <p className={styles.cardDesc}>
                근태·급여 변경 내역을 실시간으로 완벽하게.
              </p>
            </div>
          </div>
        </div>

        {/* Footer absolutely positioned at the bottom left */}
        <footer className={styles.footer}>
          <p>부산 동래구 미남로 148 (온천동) 6층 세무법인 가온택스 / 대표세무사: 허건우</p>
          <p>울산 남구 문수로 392번길 3 (신정동) 207호 신정노동법률사무소 / 대표노무사: 장원교</p>
          <p className={styles.footerBottom}>@ Copyright © Labor&Tax Corporation. All rights reserved.</p>
        </footer>
      </div>

      {/* Right Section - Light Elevated Form Form */}
      <div className={styles.rightSection}>
        <div className={styles.loginBox}>
          
          <h2 className={styles.loginTitle}>고객사 로그인</h2>
          <p className={styles.loginSubtitle}>이메일과 비밀번호를 입력해 주세요.</p>

          <div className={styles.roleToggle}>
            <button 
              className={`${styles.roleBtn} ${role === 'ceo' ? styles.activeRole : ''}`}
              onClick={() => setRole('ceo')}
            >
              대표
            </button>
            <button 
              className={`${styles.roleBtn} ${role === 'hr' ? styles.activeRole : ''}`}
              onClick={() => setRole('hr')}
            >
              인사담당자
            </button>
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.inputLabel}>이메일 주소</label>
            <input type="email" placeholder="name@company.com" className={styles.inputField} />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.inputLabel}>비밀번호</label>
            <input type="password" placeholder="비밀번호 입력" className={styles.inputField} />
          </div>

          <div className={styles.loginOptions}>
            <label className={styles.checkboxContainer}>
              <input type="checkbox" className={styles.checkboxItem} defaultChecked />
              <span className={styles.checkboxLabel}>로그인 유지</span>
            </label>
            <label className={styles.checkboxContainer}>
              <input type="checkbox" className={styles.checkboxItem} />
              <span className={styles.checkboxLabel}>이메일 저장</span>
            </label>
          </div>

          <div className={styles.securityNote}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            허용된 사내 IP에서만 로그인할 수 있습니다
          </div>

          <button className={styles.submitBtn}>로그인</button>

          <div className={styles.bottomLinks}>
            <Link href="#" className={styles.linkItem}>비밀번호 찾기</Link>
            <span style={{color: '#E2E8F0'}}>|</span>
            <Link href="#" className={styles.linkItem}>이메일 찾기</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
