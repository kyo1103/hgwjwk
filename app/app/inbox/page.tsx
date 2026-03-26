import Link from "next/link";
import { InternalShell } from "@/components/InternalShell";
import { serviceRequests, workTasks, tenants } from "@/lib/data";
import { Clock, CheckCircle } from "lucide-react";
import styles from "./Inbox.module.css";

export default function InternalInboxPage() {
  const newReqs = serviceRequests.filter((r) => r.status === "received");
  const doing = workTasks.filter((t) => t.status === "doing");
  const nearDeadlines = serviceRequests.filter((r) => !!r.due_date && r.status !== "done").slice(0, 5);

  return (
    <InternalShell active="인박스">
      
      {/* Top Header & Filter Tabs */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Triage & Operations</h2>
          <p className={styles.pageSubtitle}>All active requests, tasks, and operational deadlines.</p>
        </div>
        <div className={styles.filterTabs}>
          <button className={`${styles.filterTab} ${styles.activeTab}`}>전체 (All)</button>
          <button className={styles.filterTab}>신규 (Triage) {newReqs.length > 0 && <span className={styles.badge}>{newReqs.length}</span>}</button>
          <button className={styles.filterTab}>진행 중 (Active) {doing.length > 0 && <span className={styles.badge}>{doing.length}</span>}</button>
        </div>
      </div>

      <div className={styles.listContainer}>
        
        {/* List Header */}
        <div className={styles.listHeaderRow}>
          <div className={`${styles.cell} ${styles.cellStatus}`}>상태 (Status)</div>
          <div className={`${styles.cell} ${styles.cellTenant}`}>고객사 (Client)</div>
          <div className={`${styles.cell} ${styles.cellTask}`}>요청/업무 (Task)</div>
          <div className={`${styles.cell} ${styles.cellDate}`}>마감일 (Due)</div>
        </div>

        {/* List Body */}
        <div className={styles.listBody}>
          
          {/* Urgent Deadlines Group */}
          {nearDeadlines.map((r) => {
            const tenant = tenants.find((t) => t.id === r.tenant_id);
            return (
              <Link key={r.id} href={`/portal/${tenant?.slug}/requests/${r.id}`} className={styles.listRow}>
                <div className={`${styles.cell} ${styles.cellStatus}`}>
                  <span className={`${styles.statusLabel} ${styles.statusUrgent}`}>Urgent</span>
                </div>
                <div className={`${styles.cell} ${styles.cellTenant}`}>{tenant?.name}</div>
                <div className={`${styles.cell} ${styles.cellTask}`}>
                  <span className={styles.taskName}>{r.title}</span>
                  <span className={styles.taskId}>#{r.id.substring(0,6)}</span>
                </div>
                <div className={`${styles.cell} ${styles.cellDate}`}>
                  <Clock className={styles.dateIcon} color="var(--red)"/>
                  <span className={styles.urgentText}>{r.due_date}</span>
                </div>
              </Link>
            )
          })}

          {/* New Requests Group (Triage) */}
          {newReqs.map((r) => {
            const tenant = tenants.find((t) => t.id === r.tenant_id);
            return (
              <Link key={r.id} href={`/portal/${tenant?.slug}/requests/${r.id}`} className={styles.listRow}>
                <div className={`${styles.cell} ${styles.cellStatus}`}>
                  <span className={`${styles.statusLabel} ${styles.statusTriage}`}>Triage</span>
                </div>
                <div className={`${styles.cell} ${styles.cellTenant}`}>{tenant?.name}</div>
                <div className={`${styles.cell} ${styles.cellTask}`}>
                  <span className={styles.taskName}>{r.title}</span>
                  <span className={styles.taskId}>#{r.id.substring(0,6)}</span>
                </div>
                <div className={`${styles.cell} ${styles.cellDate}`}>
                  <span className={styles.mutedText}>-</span>
                </div>
              </Link>
            )
          })}

          {/* Doing Tasks Group */}
          {doing.map((t) => (
            <div key={t.id} className={styles.listRow}>
               <div className={`${styles.cell} ${styles.cellStatus}`}>
                  <span className={`${styles.statusLabel} ${styles.statusDoing}`}>Doing</span>
                </div>
                <div className={`${styles.cell} ${styles.cellTenant}`}>Internal</div>
                <div className={`${styles.cell} ${styles.cellTask}`}>
                  <span className={styles.taskName}>{t.title}</span>
                </div>
                <div className={`${styles.cell} ${styles.cellDate}`}>
                  <span className={styles.mutedText}>-</span>
                </div>
            </div>
          ))}

          {nearDeadlines.length === 0 && newReqs.length === 0 && doing.length === 0 && (
            <div className={styles.emptyState}>No active tasks or requests. You are all caught up.</div>
          )}
        </div>
      </div>
    </InternalShell>
  );
}
