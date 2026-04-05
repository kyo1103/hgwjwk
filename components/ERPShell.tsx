"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import styles from "@/components/erp/wemembers.module.css";
import ThemeToggle from "@/components/ThemeToggle";
import CopyPageButton from "@/components/CopyPageButton";

export default function ERPShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

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
          <CopyPageButton label="자동화 ERP" />
          <ThemeToggle />
          <button className={`${styles.topAction} ${styles.topActionPrimary}`}>채팅상담</button>
          <button className={`${styles.topAction} ${styles.topActionPrimary}`}>위멤버스 자동수집</button>
          <button className={`${styles.topAction} ${styles.topActionText}`}>메뉴얼</button>
          <button className={`${styles.topAction} ${styles.topActionText}`}>바로가기</button>
        </div>
      </header>

      <nav className={styles.topTabs}>
        <Link href="/erp/control-tower" className={`${styles.topTab} ${isBusiness ? styles.topTabActive : ""}`}>
          사업
        </Link>
        <Link href="/erp/report" className={`${styles.topTab} ${isReport ? styles.topTabActive : ""}`}>
          보고서
        </Link>
      </nav>

      <div className={styles.shellBody}>
        <main className={styles.contentArea} data-copy-root>
          {children}
        </main>
      </div>
    </div>
  );
}
