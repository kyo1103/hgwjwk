"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import styles from "@/components/erp/wemembers.module.css";
import ThemeToggle from "@/components/ThemeToggle";

type NavEntry = {
  label: string;
  href?: string;
  active?: boolean;
  count?: string;
  children?: Array<{ label: string; href?: string; active?: boolean }>;
};

type ModuleConfig = {
  tone: "blue" | "teal";
  title: string;
  iconText: string;
  userName: string;
  actions: Array<{ label: string; primary?: boolean; text?: boolean }>;
  nav: NavEntry[];
  promo?: string;
};

function getModuleConfig(pathname: string): ModuleConfig {
  if (pathname.startsWith("/erp/payroll")) {
    return {
      tone: "blue",
      title: "급여관리",
      iconText: "급",
      userName: "허건우 님",
      actions: [
        { label: "채팅상담", primary: true },
        { label: "위멤버스 자동수집", primary: true },
        { label: "메뉴얼", text: true },
        { label: "바로가기", text: true },
      ],
      nav: [
        { label: "신고리스트 관리", href: "/erp/payroll", active: pathname === "/erp/payroll", count: "205" },
        {
          label: "원천세 신고업무",
          active: pathname === "/erp/payroll",
          children: [
            { label: "납부서 발송" },
            { label: "원천징수이행상황신고서" },
            { label: "간이지급명세서" },
            { label: "연간신고현황" },
            { label: "연간지급명세서조회" },
          ],
        },
        { label: "환경설정" },
      ],
    };
  }

  if (pathname.startsWith("/erp/clients")) {
    return {
      tone: "teal",
      title: "수입처",
      iconText: "TX",
      userName: "허건우 님",
      actions: [
        { label: "채팅상담", primary: true },
        { label: "WeTalk", text: true },
        { label: "SMS", text: true },
        { label: "메뉴얼", text: true },
        { label: "바로가기", text: true },
      ],
      nav: [
        { label: "거래처 조회", href: "/erp/clients", active: pathname === "/erp/clients", count: "205" },
        { label: "담당자 / 그룹" },
        { label: "부가세 신고관리" },
        { label: "급여 신고관리" },
        {
          label: "수입처 편의 기능관리",
          active: true,
          children: [
            { label: "사업용 카드/계좌 발송" },
            { label: "위멤버스 업무이력" },
            { label: "기능 개선 & 문의" },
            { label: "민원증명 발급내역조회" },
            { label: "발송 이력조회" },
          ],
        },
      ],
      promo: "지인에게 위멤버스 추천하고 4만 포인트 받기",
    };
  }

  return {
    tone: "blue",
    title: "4대보험",
    iconText: "4보",
    userName: "허건우 님",
    actions: [
      { label: "채팅상담", primary: true },
      { label: "위멤버스 자동수집", primary: true },
      { label: "메뉴얼", text: true },
      { label: "바로가기", text: true },
    ],
    nav: [
      { label: "4대보험 조회", href: "/erp/documents", active: pathname === "/erp/documents" },
      { label: "4대보험 고지내역", href: "/erp", active: pathname === "/erp" },
      { label: "국민연금 두루누리 지원금" },
      { label: "고용보험 두루누리 지원금" },
      { label: "4대보험 납부/미납내역" },
      { label: "4대보험 민원 접수 현황" },
      {
        label: "4대보험 설정",
        active: pathname.startsWith("/erp/settings"),
        children: [
          { label: "수집 거래처 설정", href: "/erp/settings", active: pathname.startsWith("/erp/settings") },
          { label: "인증서 설정" },
        ],
      },
    ],
  };
}

export default function ERPShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const config = getModuleConfig(pathname);
  const topBarTone =
    config.tone === "teal"
      ? `${styles.topBar} ${styles.topBarTeal}`
      : `${styles.topBar} ${styles.topBarBlue}`;

  return (
    <div className={styles.shellRoot}>
      <header className={topBarTone}>
        <div className={styles.brandBlock}>
          <div className={styles.brandIcon}>{config.iconText}</div>
          <div className={styles.brandTitle}>{config.title}</div>
        </div>
        <div className={styles.topActions}>
          <ThemeToggle />
          {config.actions.map((action) => (
            <button
              key={action.label}
              className={[
                styles.topAction,
                action.primary ? styles.topActionPrimary : "",
                action.text ? styles.topActionText : "",
              ].join(" ").trim()}
            >
              {action.label}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.shellBody}>
        <aside className={styles.sidebar}>
          <div className={styles.userStrip}>
            <div className={styles.userName}>{config.userName}</div>
            <button className={styles.gearButton}>설</button>
          </div>

          <div className={styles.navScroll}>
            {config.nav.map((entry) => {
              const isLink = Boolean(entry.href);
              const className = entry.active
                ? entry.href
                  ? `${styles.mainLink} ${styles.mainLinkActive}`
                  : `${styles.groupHeader} ${styles.groupHeaderActive}`
                : entry.href
                  ? styles.mainLink
                  : styles.groupHeader;

              return (
                <div key={entry.label}>
                  {isLink ? (
                    <Link href={entry.href!} className={className}>
                      <span>{entry.label}</span>
                      {entry.count ? <span className={styles.linkCount}>{entry.count}</span> : null}
                    </Link>
                  ) : (
                    <div className={className}>
                      <span>{entry.label}</span>
                      <span className={styles.groupArrow}>▾</span>
                    </div>
                  )}

                  {entry.children ? (
                    <div className={styles.childList}>
                      {entry.children.map((child) =>
                        child.href ? (
                          <Link
                            key={child.label}
                            href={child.href}
                            className={
                              child.active
                                ? `${styles.childLink} ${styles.childLinkActive}`
                                : styles.childLink
                            }
                          >
                            {child.label}
                          </Link>
                        ) : (
                          <div
                            key={child.label}
                            className={
                              child.active
                                ? `${styles.childLink} ${styles.childLinkActive}`
                                : styles.childLink
                            }
                          >
                            {child.label}
                          </div>
                        ),
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className={styles.sidebarFooter}>
            {config.promo ? (
              <div className={styles.promoCard}>
                <div className={styles.promoText}>{config.promo}</div>
              </div>
            ) : null}
            <div className={styles.copyright}>Copyright(c) Webcash. All rights reserved.</div>
          </div>
        </aside>

        <main className={styles.contentArea}>{children}</main>
      </div>
    </div>
  );
}
