"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import styles from "@/components/erp/wemembers.module.css";
import ThemeToggle from "@/components/ThemeToggle";

export default function ERPShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // 기본정보 / 사업 / 보고서 라우팅 경로
  // 현재 '사업' 탭은 스프레드시트 뷰인 /erp/control-tower 에 매칭
  const isInfo = pathname.startsWith("/erp/info");
  const isBusiness = pathname.startsWith("/erp/control-tower");
  const isReport = pathname.startsWith("/erp/report");

  return (
    <div className={styles.shellRoot}>
      <header className={`${styles.topBar} ${styles.topBarBlue}`}>
        <div className={styles.brandBlock}>
          <div className={styles.brandIcon}>ERP</div>
          <div className={styles.brandTitle}>자동화 ERP</div>
        </div>
        <div className={styles.topActions}>
          <ThemeToggle />
          <button className={`${styles.topAction} ${styles.topActionPrimary}`}>
            채팅상담
          </button>
          <button className={`${styles.topAction} ${styles.topActionPrimary}`}>
            위멤버스 자동수집
          </button>
          <button className={`${styles.topAction} ${styles.topActionText}`}>
            메뉴얼
          </button>
          <button className={`${styles.topAction} ${styles.topActionText}`}>
            바로가기
          </button>
        </div>
      </header>
      
      {/* 새로운 상단 탭 네비게이션 */}
      <nav className={styles.topTabs}>
        <Link 
          href="/erp/info" 
          className={`${styles.topTab} ${isInfo ? styles.topTabActive : ""}`}
        >
          기본정보
        </Link>
        <Link 
          href="/erp/control-tower" 
          className={`${styles.topTab} ${isBusiness ? styles.topTabActive : ""}`}
        >
          사업
        </Link>
        <Link 
          href="/erp/report" 
          className={`${styles.topTab} ${isReport ? styles.topTabActive : ""}`}
        >
          보고서
        </Link>
      </nav>

      <div className={styles.shellBody}>
        <main className={styles.contentArea}>
          {children}
        </main>
      </div>
    </div>
  );
}
