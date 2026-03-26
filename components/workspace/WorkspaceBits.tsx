import styles from "./workspace.module.css";
import type { ConnectorStatus, ERPDocument, ERPJob } from "@/lib/erp-types";
import { CONNECTOR_LABELS, STATUS_LABELS, formatDateTime } from "@/components/workspace/helpers";

export type FlashTone = "success" | "error" | "info";
export type FlashMessage = { tone: FlashTone; text: string } | null;

export function statusTone(status: ConnectorStatus) {
  if (status === "SUCCESS") return styles.toneSuccess;
  if (status === "RUNNING" || status === "READY") return styles.toneInfo;
  if (status === "NEED_LOGIN" || status === "NEED_CONSENT") return styles.toneWarn;
  return styles.toneDanger;
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className={styles.statCard}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{hint}</p>
    </article>
  );
}

export function FlashBanner({ message }: { message: FlashMessage }) {
  if (!message) return null;

  return (
    <div
      className={`${styles.flashBanner} ${
        message.tone === "success"
          ? styles.flashSuccess
          : message.tone === "error"
            ? styles.flashError
            : styles.flashInfo
      }`}
    >
      {message.text}
    </div>
  );
}

export function DocumentsPanel({
  companyName,
  documents,
}: {
  companyName: string;
  documents: ERPDocument[];
}) {
  return (
    <section className={styles.surfaceCard}>
      <div className={styles.surfaceHeader}>
        <div>
          <span className={styles.sectionEyebrow}>Documents</span>
          <h2 className={styles.surfaceTitle}>{companyName} 문서 보관함</h2>
        </div>
        <span className={styles.counterPill}>{documents.length}건</span>
      </div>

      {documents.length === 0 ? (
        <p className={styles.emptyState}>아직 연결 문서가 없습니다.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>채널</th>
                <th>문서</th>
                <th>생성 시각</th>
                <th>다운로드</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id}>
                  <td>{CONNECTOR_LABELS[document.channelKey]}</td>
                  <td>
                    <div className={styles.tablePrimary}>{document.documentType}</div>
                    <div className={styles.tableSecondary}>{document.fileName}</div>
                  </td>
                  <td>{formatDateTime(document.createdAt)}</td>
                  <td>
                    {document.downloadUrl ? (
                      <a
                        href={document.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.tableLink}
                      >
                        열기
                      </a>
                    ) : (
                      <span className={styles.tableSecondary}>수집 후 활성화</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function JobsPanel({ jobs }: { jobs: ERPJob[] }) {
  return (
    <section className={styles.surfaceCard}>
      <div className={styles.surfaceHeader}>
        <div>
          <span className={styles.sectionEyebrow}>Recent Jobs</span>
          <h2 className={styles.surfaceTitle}>최근 실행 이력</h2>
        </div>
        <span className={styles.counterPill}>{jobs.length}건</span>
      </div>

      {jobs.length === 0 ? (
        <p className={styles.emptyState}>최근 작업이 없습니다.</p>
      ) : (
        <div className={styles.jobList}>
          {jobs.map((job) => (
            <article key={job.id} className={styles.jobItem}>
              <div className={styles.jobItemHeader}>
                <strong>{job.scope.map((channel) => CONNECTOR_LABELS[channel]).join(" + ")}</strong>
                <span className={`${styles.statusPill} ${statusTone(job.status)}`}>
                  {STATUS_LABELS[job.status]}
                </span>
              </div>
              <p>{job.resultMessage || "작업이 시작되어 상태를 추적 중입니다."}</p>
              <span>{formatDateTime(job.finishedAt || job.requestedAt)}</span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
