import Link from "next/link";
import { Inbox, LayoutDashboard, FileText, Users, Activity } from "lucide-react";
import styles from "./InternalShell.module.css";

type Props = {
  active: string;
  children: React.ReactNode;
};

const nav = [
  { href: "/app/inbox", label: "인박스", icon: Inbox },
  { href: "/app/requests", label: "요청함", icon: LayoutDashboard },
  { href: "/app/templates", label: "업무 템플릿", icon: FileText },
  { href: "/app/tenants", label: "고객사 관리", icon: Users },
  { href: "/app/logs", label: "로그/발송이력", icon: Activity }
];

export function InternalShell({ active, children }: Props) {
  return (
    <div className={styles.shellWrapper}>
      {/* Persistent Left Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.brandName}>가온텍스 × 신정 노무</span>
          <span className={styles.subBrand}>통합 자문센터 (Operations Hub)</span>
        </div>
        <nav className={styles.navMenu}>
          {nav.map((n) => {
            const Icon = n.icon;
            const isActive = active === n.label;
            return (
              <Link 
                key={n.href} 
                href={n.href} 
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                <Icon className={styles.navIcon} />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        <header className={styles.topBar}>
          <h1 className={styles.pageTitle}>{active}</h1>
        </header>
        <main className={styles.contentWrapper}>
          {children}
        </main>
      </div>
    </div>
  );
}
