import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import {
  BadgeHelp,
  BriefcaseBusiness,
  Building2,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Landmark,
  MessageSquareText,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import styles from "@/components/PortalShell.module.css";
import ThemeToggle from "@/components/ThemeToggle";
import CopyPageButton from "@/components/CopyPageButton";
import { memberships } from "@/lib/data";
import { getPortalContext } from "@/lib/portal-context";
import { portalHiddenLabels, portalPrimaryTabs, portalUtilityTabs } from "@/lib/portal-config";
import type { Tenant } from "@/lib/types";
import { getUserById } from "@/lib/users";

type Props = {
  tenant: Tenant;
  active: string;
  children: ReactNode;
};

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  company: Building2,
  payroll: ReceiptText,
  tax: Landmark,
  certificates: ShieldCheck,
  insights: Sparkles,
  qna: BadgeHelp,
  consulting: FolderKanban,
  people: Users,
  requests: MessageSquareText,
  files: FileText,
  contracts: BriefcaseBusiness,
};

export function PortalShell({ tenant, active, children }: Props) {
  const context = getPortalContext(tenant);
  const ownerMembership = memberships.find((membership) => membership.tenant_id === tenant.id && membership.role === "owner");
  const owner = ownerMembership ? getUserById(ownerMembership.user_id) : null;
  const activeLabel =
    [...portalPrimaryTabs, ...portalUtilityTabs].find((tab) => tab.key === active)?.label ??
    portalHiddenLabels[active] ??
    active;

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brandBlock}>
          <Link href="/" className={styles.brandLink}>
            <span className={styles.brandMark}>신</span>
            <div>
              <strong>신정 통합 포털</strong>
              <span>Tax · Labor · ERP</span>
            </div>
          </Link>

          <div className={styles.tenantCard}>
            <span className={styles.cardEyebrow}>Client Workspace</span>
            <strong>{tenant.name}</strong>
            <p>대표 {owner?.name ?? "미등록"} · 열람자 {context.session.name}</p>
          </div>
        </div>

        <nav className={styles.navSection}>
          <span className={styles.sectionTitle}>필수 탭</span>
          {context.visibleTabs.map((tab) => {
            const Icon = iconMap[tab.key] ?? FileText;
            const isActive = tab.key === active;

            return (
              <Link
                key={tab.key}
                href={`/portal/${tenant.slug}/${tab.href}`}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              >
                <Icon className={styles.navIcon} />
                <span className={styles.navText}>
                  <strong>{tab.label}</strong>
                  <small>{tab.description}</small>
                </span>
                {tab.badge ? <span className={styles.navBadge}>{tab.badge}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className={styles.navSection}>
          <span className={styles.sectionTitle}>실무 바로가기</span>
          {context.visibleUtilityTabs.map((tab) => {
            const Icon = iconMap[tab.key] ?? FileText;
            const isActive = tab.key === active;

            return (
              <Link
                key={tab.key}
                href={`/portal/${tenant.slug}/${tab.href}`}
                className={`${styles.utilityItem} ${isActive ? styles.utilityItemActive : ""}`}
              >
                <Icon className={styles.utilityIcon} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>

        <div className={styles.policyCard}>
          <span className={styles.sectionTitle}>현재 권한</span>
          <strong>{context.viewerRoleLabel}</strong>
          <ul className={styles.policyList}>
            <li>{context.access.canViewSensitiveOwnerDocs ? "대표자 민감정보 열람 가능" : "대표자 민감정보 비노출"}</li>
            <li>{context.access.canViewBilling ? "청구·계약 섹션 열람 가능" : "청구·계약 섹션 비노출"}</li>
            <li>{context.access.canIssueCertificates ? "민원증명 셀프 발급 가능" : "민원증명 발급 제한"}</li>
          </ul>
        </div>
      </aside>

      <div className={styles.content}>
        <header className={styles.topbar}>
          <div>
            <span className={styles.topbarEyebrow}>Portal</span>
            <h1>{activeLabel}</h1>
            <p>{tenant.name}의 고객사 전용 협업 포털입니다.</p>
          </div>

          <div className={styles.topbarMeta}>
            <CopyPageButton label={`${tenant.name} ${activeLabel}`} />
            <div className={styles.metaCard} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ThemeToggle />
            </div>
            <div className={styles.metaCard}>
              <span>열람자</span>
              <strong>{context.session.name}</strong>
            </div>
            <div className={styles.metaCard}>
              <span>역할</span>
              <strong>{context.viewerRoleLabel}</strong>
            </div>
            <div className={styles.metaCard}>
              <span>보안상태</span>
              <strong>{context.access.canViewSensitiveOwnerDocs ? "민감정보 허용" : "민감정보 차단"}</strong>
            </div>
          </div>
        </header>

        <div className={styles.noticeBar}>
          <span>핵심 운영 원칙</span>
          <p>고객사는 자료를 쉽게 올리고, 세무·노무는 같은 흐름에서 꺼내 쓰도록 탭 구조를 재편했습니다.</p>
        </div>

        <main className={styles.main} data-copy-root>
          {children}
        </main>
      </div>
    </div>
  );
}
