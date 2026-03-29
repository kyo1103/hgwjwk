"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./workspace.module.css";
import { useERPState } from "@/lib/use-erp-state";
import type { ChannelKey, ERPClient, ERPDocument, ERPJob } from "@/lib/erp-types";
import type { WorkspaceSession } from "@/lib/workspace-users";
import {
  CONNECTOR_LABELS,
  KAKAO_TEMPLATES,
  STATUS_LABELS,
  channelSummary,
  defaultTemplateParams,
  formatFullDateTime,
  previewMessage,
  type KakaoConfigStatus,
  type KakaoTemplateCode,
} from "@/components/workspace/helpers";
import {
  DocumentsPanel,
  FlashBanner,
  JobsPanel,
  StatCard,
  statusTone,
  type FlashMessage,
} from "@/components/workspace/WorkspaceBits";

export default function WorkspaceDashboard({ session }: { session: WorkspaceSession }) {
  const router = useRouter();
  const { data, isLoading, error, refresh } = useERPState();
  const [selectedClientId, setSelectedClientId] = useState(session.clientId ?? "");
  const [jobFlash, setJobFlash] = useState<FlashMessage>(null);
  const [jobActionKey, setJobActionKey] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [kakaoStatus, setKakaoStatus] = useState<KakaoConfigStatus | null>(null);
  const [kakaoStatusLoading, setKakaoStatusLoading] = useState(false);
  const [kakaoTemplate, setKakaoTemplate] = useState<KakaoTemplateCode>("DOC_COLLECT_DONE");
  const [kakaoParams, setKakaoParams] = useState<Record<string, string>>({});
  const [kakaoPhone, setKakaoPhone] = useState(session.phone);
  const [kakaoFlash, setKakaoFlash] = useState<FlashMessage>(null);
  const [sendingKakao, setSendingKakao] = useState(false);

  const clients = data?.clients ?? [];

  useEffect(() => {
    if (!clients.length) return;

    if (session.scope === "client") {
      if (session.clientId && selectedClientId !== session.clientId) {
        setSelectedClientId(session.clientId);
      }
      return;
    }

    const exists = clients.some((client) => client.id === selectedClientId);
    if (!exists) {
      const nextClient = clients.find((client) => client.mandateStatus === "ACTIVE") ?? clients[0];
      setSelectedClientId(nextClient.id);
    }
  }, [clients, selectedClientId, session.clientId, session.scope]);

  const currentClient =
    clients.find((client) =>
      client.id === (session.scope === "client" ? session.clientId : selectedClientId),
    ) ?? clients[0];

  const documents = currentClient
    ? (data?.documents ?? []).filter((document) => document.clientId === currentClient.id).slice(0, 8)
    : [];
  const jobs = currentClient
    ? (data?.jobs ?? []).filter((job) => job.clientId === currentClient.id).slice(0, 6)
    : [];
  const runningJobs = jobs.filter((job) => job.status === "RUNNING");
  const currentTemplate = KAKAO_TEMPLATES.find((template) => template.code === kakaoTemplate) ?? KAKAO_TEMPLATES[0];

  useEffect(() => {
    setKakaoPhone(session.phone);
  }, [session.phone]);

  useEffect(() => {
    setKakaoParams(defaultTemplateParams(kakaoTemplate, session, currentClient));
  }, [currentClient, kakaoTemplate, session]);

  useEffect(() => {
    if (!jobFlash) return;
    const timer = window.setTimeout(() => setJobFlash(null), 5000);
    return () => window.clearTimeout(timer);
  }, [jobFlash]);

  useEffect(() => {
    if (!kakaoFlash) return;
    const timer = window.setTimeout(() => setKakaoFlash(null), 5000);
    return () => window.clearTimeout(timer);
  }, [kakaoFlash]);

  async function loadKakaoStatus() {
    setKakaoStatusLoading(true);
    try {
      const response = await fetch("/api/kakao/send", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("카카오 설정을 확인하지 못했습니다.");
      }

      const nextStatus = (await response.json()) as KakaoConfigStatus;
      setKakaoStatus(nextStatus);
    } catch {
      setKakaoStatus(null);
    } finally {
      setKakaoStatusLoading(false);
    }
  }

  useEffect(() => {
    void loadKakaoStatus();
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.refresh();
  }

  async function handleCollection(scope: ChannelKey[], label: string) {
    if (!currentClient) return;

    setJobActionKey(label);
    setJobFlash(null);

    try {
      const response = await fetch(`/api/clients/${currentClient.id}/jobs/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope,
          requestedBy: session.userId,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "수집 작업을 시작하지 못했습니다.");
      }

      await refresh();
      setJobFlash({
        tone: "success",
        text: `${currentClient.name}의 ${label} 작업을 시작했습니다.`,
      });
    } catch (nextError) {
      setJobFlash({
        tone: "error",
        text: nextError instanceof Error ? nextError.message : "수집 작업 요청에 실패했습니다.",
      });
    } finally {
      setJobActionKey(null);
    }
  }

  async function handleKakaoSend() {
    if (!kakaoPhone.trim()) {
      setKakaoFlash({ tone: "error", text: "수신 번호를 입력해 주세요." });
      return;
    }

    setSendingKakao(true);
    setKakaoFlash(null);

    try {
      const response = await fetch("/api/kakao/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "alimtalk",
          payload: {
            recipientPhone: kakaoPhone,
            templateCode: kakaoTemplate,
            templateParams: kakaoParams,
          },
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "카카오 전송에 실패했습니다.");
      }

      setKakaoFlash({ tone: "success", text: "카카오 메시지를 전송했습니다." });
      await loadKakaoStatus();
    } catch (nextError) {
      setKakaoFlash({
        tone: "error",
        text: nextError instanceof Error ? nextError.message : "카카오 전송에 실패했습니다.",
      });
    } finally {
      setSendingKakao(false);
    }
  }

  if (isLoading && !data) {
    return (
      <div className={styles.root}>
        <div className={styles.container}>
          <header className={styles.topbar}>
            <div>
              <span className={styles.sectionEyebrow}>Loading</span>
              <h1 className={styles.topbarTitle}>통합 워크스페이스를 불러오는 중입니다.</h1>
            </div>
          </header>
          <section className={styles.surfaceCard}>
            <p className={styles.emptyState}>ERP 상태를 읽어오는 중입니다.</p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <header className={styles.topbar}>
          <div>
            <span className={styles.sectionEyebrow}>Unified Workspace</span>
            <h1 className={styles.topbarTitle}>
              {session.scope === "admin" ? "관리자 운영 워크스페이스" : "고객사 전용 워크스페이스"}
            </h1>
            <p className={styles.topbarText}>
              같은 루트 주소에서 로그인했고, 현재 계정 권한에 맞는 화면만 노출되고 있습니다.
            </p>
          </div>

          <div className={styles.topbarActions}>
            <div className={styles.userBadge}>
              <span>{session.roleLabel}</span>
              <strong>{session.name}</strong>
            </div>
            {session.scope === "admin" ? (
              <>
                <Link href="/erp/control-tower" className={styles.linkButton}>
                  신고 관제탑
                </Link>
                <Link href="/erp" className={styles.linkButton}>
                  전체 ERP
                </Link>
                <Link href="/erp/kakao" className={styles.linkButton}>
                  카카오 센터
                </Link>
              </>
            ) : session.tenantSlug ? (
              <Link href={`/portal/${session.tenantSlug}/dashboard`} className={styles.linkButton}>
                고객 포털 상세
              </Link>
            ) : null}
            <button
              type="button"
              className={styles.secondaryButton}
              disabled={loggingOut}
              onClick={handleLogout}
            >
              {loggingOut ? "로그아웃 중..." : "로그아웃"}
            </button>
          </div>
        </header>

        {error ? <FlashBanner message={{ tone: "error", text: error }} /> : null}

        {session.scope === "admin" ? (
          <AdminView
            clients={clients}
            currentClientId={currentClient?.id}
            setCurrentClientId={setSelectedClientId}
            currentClientName={currentClient?.name ?? ""}
            jobActionKey={jobActionKey}
            jobFlash={jobFlash}
            jobs={jobs}
            documents={documents}
            dataBridgeConnected={Boolean(data?.bridgeAgent.connected)}
            dataBridgePort={data?.bridgeAgent.port}
            stats={data?.stats}
            runningJobsCount={runningJobs.length}
            onRun={handleCollection}
          />
        ) : (
          <ClientView
            companyName={session.companyName}
            currentClient={currentClient}
            jobActionKey={jobActionKey}
            jobFlash={jobFlash}
            jobs={jobs}
            documents={documents}
            onRun={handleCollection}
            tenantSlug={session.tenantSlug}
          />
        )}

        <section className={styles.kakaoSection}>
          <div className={styles.surfaceHeader}>
            <div>
              <span className={styles.sectionEyebrow}>Kakao</span>
              <h2 className={styles.surfaceTitle}>
                {session.scope === "admin" ? "카카오톡 바로 전송" : "카카오 안내 즉시 받기"}
              </h2>
            </div>
            <Link href="/erp/kakao" className={styles.linkButton}>
              전체 메시지 센터
            </Link>
          </div>

          <div className={styles.kakaoGrid}>
            <section className={styles.surfaceCard}>
              <label className={styles.field}>
                <span>수신 번호</span>
                <input
                  type="tel"
                  value={kakaoPhone}
                  onChange={(event) => setKakaoPhone(event.target.value)}
                  placeholder="010-0000-0000"
                />
              </label>

              <label className={styles.field}>
                <span>전송 템플릿</span>
                <select
                  value={kakaoTemplate}
                  onChange={(event) => setKakaoTemplate(event.target.value as KakaoTemplateCode)}
                >
                  {KAKAO_TEMPLATES.map((template) => (
                    <option key={template.code} value={template.code}>
                      {template.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className={styles.templateHint}>{currentTemplate.description}</div>

              <div className={styles.fieldGrid}>
                {currentTemplate.fields.map((field) => (
                  <label key={field} className={styles.field}>
                    <span>{field}</span>
                    <input
                      type="text"
                      value={kakaoParams[field] ?? ""}
                      onChange={(event) =>
                        setKakaoParams((current) => ({
                          ...current,
                          [field]: event.target.value,
                        }))
                      }
                    />
                  </label>
                ))}
              </div>

              {kakaoFlash ? <FlashBanner message={kakaoFlash} /> : null}

              <div className={styles.buttonRow}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  disabled={sendingKakao}
                  onClick={handleKakaoSend}
                >
                  {sendingKakao ? "전송 중..." : "카카오 즉시 전송"}
                </button>
              </div>
            </section>

            <section className={styles.surfaceCard}>
              <div className={styles.previewBox}>
                <span className={styles.sectionEyebrow}>Preview</span>
                <pre>{previewMessage(kakaoTemplate, kakaoParams)}</pre>
              </div>

              <div className={styles.configBox}>
                <div className={styles.configHeader}>
                  <strong>설정 상태</strong>
                  <button type="button" className={styles.ghostButton} onClick={() => void loadKakaoStatus()}>
                    {kakaoStatusLoading ? "확인 중..." : "다시 확인"}
                  </button>
                </div>

                {kakaoStatus ? (
                  <>
                    <div className={`${styles.statusPill} ${kakaoStatus.configured ? styles.toneSuccess : styles.toneDanger}`}>
                      {kakaoStatus.configured ? "전송 가능" : "설정 필요"}
                    </div>
                    <p className={styles.configText}>
                      필수 누락: {kakaoStatus.missing.length ? kakaoStatus.missing.join(", ") : "없음"}
                    </p>
                    <p className={styles.configText}>
                      선택 누락: {kakaoStatus.optionalMissing.length ? kakaoStatus.optionalMissing.join(", ") : "없음"}
                    </p>
                  </>
                ) : (
                  <p className={styles.configText}>카카오 설정 상태를 불러오지 못했습니다.</p>
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}

function AdminView(props: {
  clients: ERPClient[];
  currentClientId?: string;
  setCurrentClientId: (clientId: string) => void;
  currentClientName: string;
  jobActionKey: string | null;
  jobFlash: FlashMessage;
  jobs: ERPJob[];
  documents: ERPDocument[];
  dataBridgeConnected: boolean;
  dataBridgePort?: number;
  stats?: {
    totalClients: number;
    todaySuccess: number;
    todayFailed: number;
    todayRunning: number;
    needsAction: number;
  };
  runningJobsCount: number;
  onRun: (scope: ChannelKey[], label: string) => void;
}) {
  return (
    <>
      <section className={styles.heroStrip}>
        <div>
          <span className={styles.sectionEyebrow}>Operations Focus</span>
          <h2 className={styles.heroStripTitle}>고객사 연결 상태와 실행 버튼을 한 화면에 배치했습니다.</h2>
          <p className={styles.heroStripText}>
            정적인 위멤버스 복제 화면이 아니라, 실제 `/api/clients/:id/jobs/run` 요청으로 홈택스와
            4대보험 수집을 시작하고 실시간 ERP 상태에 반영됩니다.
          </p>
        </div>
        <div className={styles.heroStripMeta}>
          <div className={styles.heroMetric}>
            <span>브리지 상태</span>
            <strong>{props.dataBridgeConnected ? "연결됨" : "오프라인"}</strong>
          </div>
          <div className={styles.heroMetric}>
            <span>브리지 주소</span>
            <strong>{props.dataBridgePort ? `:${props.dataBridgePort}` : "확인 필요"}</strong>
          </div>
        </div>
      </section>

      <section className={styles.statsGrid}>
        <StatCard label="활성 고객사" value={String(props.stats?.totalClients ?? 0)} hint="수임 상태 ACTIVE 기준" />
        <StatCard label="오늘 성공" value={String(props.stats?.todaySuccess ?? 0)} hint="브리지 연동 완료" />
        <StatCard label="진행 중" value={String(props.stats?.todayRunning ?? 0)} hint="실시간 수집 작업" />
        <StatCard label="조치 필요" value={String(props.stats?.needsAction ?? 0)} hint="로그인/동의/오류" />
      </section>

      <div className={styles.adminGrid}>
        <aside className={styles.surfaceCard}>
          <div className={styles.surfaceHeader}>
            <div>
              <span className={styles.sectionEyebrow}>Clients</span>
              <h2 className={styles.surfaceTitle}>관리 대상 고객사</h2>
            </div>
            <span className={styles.counterPill}>{props.clients.length}개</span>
          </div>

          <div className={styles.clientList}>
            {props.clients.map((client) => (
              <button
                key={client.id}
                type="button"
                className={`${styles.clientItem} ${client.id === props.currentClientId ? styles.clientItemActive : ""}`}
                onClick={() => props.setCurrentClientId(client.id)}
              >
                <div className={styles.clientItemHeader}>
                  <strong>{client.name}</strong>
                  <span className={`${styles.statusPill} ${statusTone(client.channels.hometax)}`}>
                    {channelSummary(client)}
                  </span>
                </div>
                <p>{client.bizNo}</p>
                <span>담당 {client.manager}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className={styles.surfaceCard}>
          <div className={styles.surfaceHeader}>
            <div>
              <span className={styles.sectionEyebrow}>Detail</span>
              <h2 className={styles.surfaceTitle}>{props.currentClientName} 연결 센터</h2>
            </div>
          </div>
          <DetailView
            clientName={props.currentClientName}
            currentClient={props.clients.find((client) => client.id === props.currentClientId)}
            jobActionKey={props.jobActionKey}
            jobFlash={props.jobFlash}
            jobs={props.jobs}
            documents={props.documents}
            runningJobsCount={props.runningJobsCount}
            onRun={props.onRun}
          />
        </section>
      </div>
    </>
  );
}

function ClientView(props: {
  companyName: string;
  currentClient?: ERPClient;
  jobActionKey: string | null;
  jobFlash: FlashMessage;
  jobs: ERPJob[];
  documents: ERPDocument[];
  onRun: (scope: ChannelKey[], label: string) => void;
  tenantSlug?: string;
}) {
  return (
    <>
      <section className={styles.heroStrip}>
        <div>
          <span className={styles.sectionEyebrow}>Client View</span>
          <h2 className={styles.heroStripTitle}>고객사 계정은 내 사업장 정보와 실행 버튼만 보입니다.</h2>
          <p className={styles.heroStripText}>
            관리자 메뉴, 타 고객사 목록, 내부 운영 정보는 숨기고 홈택스/4대보험 상태와 최신 서류,
            카카오 안내 발송만 남겼습니다.
          </p>
        </div>
        <div className={styles.heroStripMeta}>
          <div className={styles.heroMetric}>
            <span>고객사</span>
            <strong>{props.companyName}</strong>
          </div>
          <div className={styles.heroMetric}>
            <span>포털</span>
            <strong>{props.tenantSlug ? "연결됨" : "미연결"}</strong>
          </div>
        </div>
      </section>

      <section className={styles.statsGrid}>
        <StatCard label="내 문서" value={String(props.documents.length)} hint="최근 8건 기준" />
        <StatCard label="최근 작업" value={String(props.jobs.length)} hint="사업장 실행 이력" />
        <StatCard
          label="홈택스 상태"
          value={props.currentClient ? STATUS_LABELS[props.currentClient.channels.hometax] : "-"}
          hint="사업장 연결 상태"
        />
        <StatCard
          label="4대보험 상태"
          value={props.currentClient ? STATUS_LABELS[props.currentClient.channels.fourInsure] : "-"}
          hint="사업장 연결 상태"
        />
      </section>

      <div className={styles.clientGrid}>
        <section className={styles.surfaceCard}>
          <div className={styles.surfaceHeader}>
            <div>
              <span className={styles.sectionEyebrow}>My Company</span>
              <h2 className={styles.surfaceTitle}>{props.currentClient?.name ?? props.companyName}</h2>
            </div>
            {props.tenantSlug ? (
              <Link href={`/portal/${props.tenantSlug}/dashboard`} className={styles.linkButton}>
                고객 포털 상세
              </Link>
            ) : null}
          </div>
          <DetailView
            clientName={props.companyName}
            currentClient={props.currentClient}
            jobActionKey={props.jobActionKey}
            jobFlash={props.jobFlash}
            jobs={props.jobs}
            documents={props.documents}
            runningJobsCount={props.jobs.filter((job) => job.status === "RUNNING").length}
            onRun={props.onRun}
            clientMode
            showDocumentsPanel={false}
          />
        </section>

        <DocumentsPanel companyName={props.companyName} documents={props.documents} />
      </div>
    </>
  );
}

function DetailView(props: {
  clientName: string;
  currentClient?: ERPClient;
  jobActionKey: string | null;
  jobFlash: FlashMessage;
  jobs: ERPJob[];
  documents: ERPDocument[];
  runningJobsCount: number;
  onRun: (scope: ChannelKey[], label: string) => void;
  clientMode?: boolean;
  showDocumentsPanel?: boolean;
}) {
  const client = props.currentClient;

  if (!client) {
    return <p className={styles.emptyState}>ERP 데이터를 찾지 못했습니다.</p>;
  }

  const channels = props.clientMode ? (["hometax", "fourInsure"] as ChannelKey[]) : (Object.keys(CONNECTOR_LABELS) as ChannelKey[]);

  return (
    <>
      <div className={styles.detailHeadline}>
        <div>
          <div className={styles.companyMeta}>{client.bizNo}</div>
          <h3>{props.clientMode ? "연결 상태와 최신 수집" : `${client.name} 연결 센터`}</h3>
          <p>담당 {client.manager} · 마지막 수집 {formatFullDateTime(client.lastRunAt)}</p>
        </div>
        <span className={styles.mandateBadge}>{client.mandateStatus}</span>
      </div>

      <div className={styles.connectorGrid}>
        {channels.map((channel) => (
          <div key={channel} className={styles.connectorCard}>
            <span>{CONNECTOR_LABELS[channel]}</span>
            <strong>{STATUS_LABELS[client.channels[channel]]}</strong>
            <div className={`${styles.statusPill} ${statusTone(client.channels[channel])}`}>
              {client.channels[channel]}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.buttonRow}>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={props.jobActionKey === (props.clientMode ? "홈택스 최신 수집" : "홈택스 연결")}
          onClick={() => props.onRun(["hometax"], props.clientMode ? "홈택스 최신 수집" : "홈택스 연결")}
        >
          {props.jobActionKey === (props.clientMode ? "홈택스 최신 수집" : "홈택스 연결")
            ? "실행 중..."
            : props.clientMode
              ? "홈택스 최신 수집"
              : "홈택스 연결 실행"}
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={props.jobActionKey === (props.clientMode ? "4대보험 최신 수집" : "4대보험 연결")}
          onClick={() =>
            props.onRun(["fourInsure"], props.clientMode ? "4대보험 최신 수집" : "4대보험 연결")
          }
        >
          {props.jobActionKey === (props.clientMode ? "4대보험 최신 수집" : "4대보험 연결")
            ? "실행 중..."
            : props.clientMode
              ? "4대보험 최신 수집"
              : "4대보험 연결 실행"}
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={props.jobActionKey === (props.clientMode ? "전체 최신 수집" : "통합 재수집")}
          onClick={() =>
            props.onRun(["hometax", "fourInsure"], props.clientMode ? "전체 최신 수집" : "통합 재수집")
          }
        >
          {props.jobActionKey === (props.clientMode ? "전체 최신 수집" : "통합 재수집")
            ? "실행 중..."
            : props.clientMode
              ? "전체 최신 수집"
              : "통합 재수집"}
        </button>
      </div>

      {props.jobFlash ? <FlashBanner message={props.jobFlash} /> : null}

      {props.runningJobsCount > 0 ? (
        <div className={styles.inlineNotice}>
          현재 진행 중인 작업이 있습니다. 하단 최근 작업에서 상태를 확인할 수 있습니다.
        </div>
      ) : null}

      {props.showDocumentsPanel === false ? (
        <JobsPanel jobs={props.jobs} />
      ) : (
        <div className={styles.contentSplit}>
          <DocumentsPanel companyName={props.clientName} documents={props.documents} />
          <JobsPanel jobs={props.jobs} />
        </div>
      )}
    </>
  );
}
