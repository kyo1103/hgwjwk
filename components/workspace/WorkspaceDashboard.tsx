"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./workspace.module.css";
import { useERPState } from "@/lib/use-erp-state";
import type { ChannelKey, ERPClient, ERPDocument, ERPJob } from "@/lib/erp-types";
import type { WorkspaceSession } from "@/lib/workspace-users";
import {
  contracts,
  documents as laborDocuments,
  employees,
  laborIssues,
  leaveBalances,
  monthlyReports,
  serviceRequests,
  taxTasks,
  tenants,
  workTasks,
} from "@/lib/data";
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
  const [adminTab, setAdminTab] = useState<"labor" | "tax">("labor");
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
            adminTab={adminTab}
            setAdminTab={setAdminTab}
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

        {session.scope === "client" ? (
          <section className={styles.kakaoSection}>
            <div className={styles.surfaceHeader}>
              <div>
                <span className={styles.sectionEyebrow}>Kakao</span>
                <h2 className={styles.surfaceTitle}>카카오 안내 즉시 받기</h2>
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
        ) : null}
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
  adminTab: "labor" | "tax";
  setAdminTab: (tab: "labor" | "tax") => void;
}) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const selectedClient = props.clients.find((client) => client.id === props.currentClientId) ?? props.clients[0];
  const tenant = tenants.find((item) => item.name === selectedClient?.name);
  const tenantEmployees = (tenant ? employees.filter((employee) => employee.tenant_id === tenant.id) : []).sort((a, b) =>
    b.hire_date.localeCompare(a.hire_date),
  );
  const selectedEmployee =
    tenantEmployees.find((employee) => employee.id === selectedEmployeeId) ?? tenantEmployees[0];
  const selectedEmployeeDocs = selectedEmployee
    ? laborDocuments.filter((document) => document.tenant_id === tenant?.id && document.employee_id === selectedEmployee.id)
    : [];
  const selectedEmployeeContracts = selectedEmployee
    ? contracts.filter((contract) => contract.tenant_id === tenant?.id && contract.employee_id === selectedEmployee.id)
    : [];
  const selectedEmployeeRequests = selectedEmployee
    ? serviceRequests.filter((request) => request.tenant_id === tenant?.id && request.employee_id === selectedEmployee.id)
    : [];
  const selectedEmployeeTasks = selectedEmployee
    ? workTasks.filter(
        (task) =>
          task.tenant_id === tenant?.id &&
          task.employee_id === selectedEmployee.id &&
          (task.domain === "노무" || task.domain === "공통"),
      )
    : [];
  const selectedEmployeeIssues = selectedEmployee
    ? laborIssues.filter((issue) => issue.tenant_id === tenant?.id && issue.employee_id === selectedEmployee.id)
    : [];
  const selectedLeaveBalance = selectedEmployee
    ? leaveBalances.find((leave) => leave.tenant_id === tenant?.id && leave.employee_id === selectedEmployee.id)
    : undefined;
  const tenantTaxTasks = tenant ? taxTasks.filter((task) => task.tenant_id === tenant.id) : [];
  const tenantMonthlyReports = tenant ? monthlyReports.filter((report) => report.tenant_id === tenant.id) : [];

  useEffect(() => {
    if (!tenantEmployees.length) {
      setSelectedEmployeeId("");
      return;
    }

    const exists = tenantEmployees.some((employee) => employee.id === selectedEmployeeId);
    if (!exists) {
      setSelectedEmployeeId(tenantEmployees[0].id);
    }
  }, [selectedEmployeeId, tenantEmployees]);

  return (
    <>
      <section className={styles.operationsHero}>
        <div>
          <span className={styles.sectionEyebrow}>Operations Desk</span>
          <h2 className={styles.heroStripTitle}>인사노무와 세무회계만 남긴 관리자 운영 워크스페이스입니다.</h2>
          <p className={styles.heroStripText}>
            고객사가 수백 개로 늘어나도 클릭형 카드보다 빠르게 훑을 수 있도록, 회사 목록과 직원 표를
            노션형 데이터베이스처럼 한 화면에 배치했습니다.
          </p>
        </div>
        <div className={styles.heroStripMeta}>
          <div className={styles.heroMetric}>
            <span>활성 고객사</span>
            <strong>{props.stats?.totalClients ?? props.clients.length}</strong>
          </div>
          <div className={styles.heroMetric}>
            <span>진행 중 작업</span>
            <strong>{props.runningJobsCount}</strong>
          </div>
        </div>
      </section>

      <section className={styles.workspaceTabs}>
        <button
          type="button"
          className={`${styles.workspaceTab} ${props.adminTab === "labor" ? styles.workspaceTabActive : ""}`}
          onClick={() => props.setAdminTab("labor")}
        >
          인사노무
        </button>
        <button
          type="button"
          className={`${styles.workspaceTab} ${props.adminTab === "tax" ? styles.workspaceTabActive : ""}`}
          onClick={() => props.setAdminTab("tax")}
        >
          세무회계
        </button>
      </section>

      {props.adminTab === "labor" ? (
        <section className={styles.boardShell}>
          <aside className={styles.companyRail}>
            <div className={styles.boardHeader}>
              <div>
                <span className={styles.sectionEyebrow}>Companies</span>
                <h2 className={styles.surfaceTitle}>관리 업체</h2>
              </div>
              <span className={styles.counterPill}>{props.clients.length}개</span>
            </div>

            <div className={styles.companyRailList}>
              {props.clients.map((client) => {
                const clientTenant = tenants.find((item) => item.name === client.name);
                const companyEmployees = clientTenant
                  ? employees.filter((employee) => employee.tenant_id === clientTenant.id)
                  : [];

                return (
                  <button
                    key={client.id}
                    type="button"
                    className={`${styles.companyRailItem} ${client.id === props.currentClientId ? styles.companyRailItemActive : ""}`}
                    onClick={() => props.setCurrentClientId(client.id)}
                  >
                    <div className={styles.companyRailItemTop}>
                      <strong>{client.name}</strong>
                      <span className={`${styles.statusPill} ${statusTone(client.channels.hometax)}`}>
                        {channelSummary(client)}
                      </span>
                    </div>
                    <span>{client.bizNo}</span>
                    <span>직원 {companyEmployees.length}명</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className={styles.boardMain}>
            <section className={styles.boardOverview}>
              <div>
                <span className={styles.sectionEyebrow}>Labor Database</span>
                <h2 className={styles.surfaceTitle}>{selectedClient?.name ?? "업체 선택"}</h2>
                <p className={styles.boardDescription}>
                  입사일 기준으로 인원 흐름을 보고, 오른쪽 상세 패널에서 계약서와 요청 이력을 바로 확인합니다.
                </p>
              </div>
              <div className={styles.boardOverviewStats}>
                <div className={styles.boardMetric}>
                  <span>담당자</span>
                  <strong>{selectedClient?.manager ?? "-"}</strong>
                </div>
                <div className={styles.boardMetric}>
                  <span>노무 리스크</span>
                  <strong>{tenant ? laborIssues.filter((issue) => issue.tenant_id === tenant.id).length : 0}</strong>
                </div>
                <div className={styles.boardMetric}>
                  <span>최근 작업</span>
                  <strong>{tenant ? workTasks.filter((task) => task.tenant_id === tenant.id).length : 0}</strong>
                </div>
              </div>
            </section>

            {tenant ? (
              <div className={styles.databaseLayout}>
                <section className={styles.databaseSheet}>
                  <div className={styles.sheetToolbar}>
                    <span className={styles.sheetLabel}>Employees</span>
                    <span className={styles.sheetSubLabel}>입사일 최신순</span>
                  </div>

                  <div className={styles.databaseTable}>
                    <div className={styles.databaseHead}>
                      <span>이름</span>
                      <span>입사일</span>
                      <span>부서</span>
                      <span>직책</span>
                      <span>계약서</span>
                      <span>자료</span>
                      <span>노무 진행</span>
                      <span>리스크</span>
                    </div>

                    {tenantEmployees.map((employee) => {
                      const employeeContracts = contracts.filter(
                        (contract) => contract.tenant_id === tenant.id && contract.employee_id === employee.id,
                      );
                      const employeeDocs = laborDocuments.filter(
                        (document) => document.tenant_id === tenant.id && document.employee_id === employee.id,
                      );
                      const employeeLaborTasks = workTasks.filter(
                        (task) =>
                          task.tenant_id === tenant.id &&
                          task.employee_id === employee.id &&
                          (task.domain === "노무" || task.domain === "공통") &&
                          task.status !== "done",
                      );
                      const employeeIssues = laborIssues.filter(
                        (issue) => issue.tenant_id === tenant.id && issue.employee_id === employee.id,
                      );

                      return (
                        <button
                          key={employee.id}
                          type="button"
                          className={`${styles.databaseRow} ${employee.id === selectedEmployee?.id ? styles.databaseRowActive : ""}`}
                          onClick={() => setSelectedEmployeeId(employee.id)}
                        >
                          <span className={styles.cellPrimary}>
                            {employee.full_name}
                            <small>{employee.employment_status === "active" ? "재직" : employee.employment_status}</small>
                          </span>
                          <span>{formatDate(employee.hire_date)}</span>
                          <span>{employee.department ?? "-"}</span>
                          <span>{employee.job_title ?? "-"}</span>
                          <span>{employeeContracts[0] ? contractStatusLabel(employeeContracts[0].status) : "미작성"}</span>
                          <span>{employeeDocs.length}건</span>
                          <span>{employeeLaborTasks.length ? `${employeeLaborTasks.length}건` : "없음"}</span>
                          <span className={employeeIssues.length ? styles.textDanger : ""}>
                            {employeeIssues.length ? `${employeeIssues.length}건` : "정상"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <aside className={styles.employeeDock}>
                  {selectedEmployee ? (
                    <>
                      <div className={styles.employeeDockHeader}>
                        <div>
                          <span className={styles.sectionEyebrow}>Selected Employee</span>
                          <h3>{selectedEmployee.full_name}</h3>
                          <p>
                            {selectedEmployee.department ?? "부서 미지정"} · {selectedEmployee.job_title ?? "직책 미지정"}
                          </p>
                        </div>
                        <span className={styles.counterPill}>{formatDate(selectedEmployee.hire_date)} 입사</span>
                      </div>

                      <div className={styles.dockGroup}>
                        <strong>핵심 상태</strong>
                        <div className={styles.dockMetrics}>
                          <div className={styles.dockMetric}>
                            <span>계약서</span>
                            <b>{selectedEmployeeContracts[0] ? contractStatusLabel(selectedEmployeeContracts[0].status) : "미작성"}</b>
                          </div>
                          <div className={styles.dockMetric}>
                            <span>잔여 연차</span>
                            <b>{selectedLeaveBalance ? `${selectedLeaveBalance.remaining_days}일` : "-"}</b>
                          </div>
                          <div className={styles.dockMetric}>
                            <span>요청</span>
                            <b>{selectedEmployeeRequests.length}건</b>
                          </div>
                        </div>
                      </div>

                      <div className={styles.dockGroup}>
                        <strong>근로계약/자료</strong>
                        <div className={styles.dockList}>
                          {selectedEmployeeContracts.map((contract) => (
                            <div key={contract.id} className={styles.dockListItem}>
                              <span>{contract.title}</span>
                              <b>{contractStatusLabel(contract.status)}</b>
                            </div>
                          ))}
                          {selectedEmployeeDocs.map((document) => (
                            <div key={document.id} className={styles.dockListItem}>
                              <span>{document.title}</span>
                              <b>{document.tags.join(", ") || document.category}</b>
                            </div>
                          ))}
                          {!selectedEmployeeContracts.length && !selectedEmployeeDocs.length ? (
                            <p className={styles.emptyState}>연결된 문서가 없습니다.</p>
                          ) : null}
                        </div>
                      </div>

                      <div className={styles.dockGroup}>
                        <strong>노무 진행 항목</strong>
                        <div className={styles.dockList}>
                          {selectedEmployeeTasks.map((task) => (
                            <div key={task.id} className={styles.dockListItem}>
                              <span>{task.title}</span>
                              <b>{task.status}</b>
                            </div>
                          ))}
                          {!selectedEmployeeTasks.length ? <p className={styles.emptyState}>열려 있는 노무 작업이 없습니다.</p> : null}
                        </div>
                      </div>

                      <div className={styles.dockGroup}>
                        <strong>이슈 / 요청</strong>
                        <div className={styles.dockList}>
                          {selectedEmployeeIssues.map((issue) => (
                            <div key={issue.id} className={styles.dockAlertItem}>
                              <span>{issue.title}</span>
                              <b>{issue.severity}</b>
                            </div>
                          ))}
                          {selectedEmployeeRequests.map((request) => (
                            <div key={request.id} className={styles.dockListItem}>
                              <span>{request.title}</span>
                              <b>{request.status}</b>
                            </div>
                          ))}
                          {!selectedEmployeeIssues.length && !selectedEmployeeRequests.length ? (
                            <p className={styles.emptyState}>등록된 이슈와 요청이 없습니다.</p>
                          ) : null}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className={styles.emptyState}>직원을 선택하면 계약서와 노무 자료가 오른쪽에 표시됩니다.</p>
                  )}
                </aside>
              </div>
            ) : (
              <section className={styles.surfaceCard}>
                <p className={styles.emptyState}>
                  아직 인사노무 세부 데이터가 연결되지 않은 고객사입니다. 회사 목록은 유지되고, 직원 데이터가
                  들어오면 같은 형식으로 바로 확장됩니다.
                </p>
              </section>
            )}
          </div>
        </section>
      ) : (
        <section className={styles.boardShell}>
          <aside className={styles.companyRail}>
            <div className={styles.boardHeader}>
              <div>
                <span className={styles.sectionEyebrow}>Companies</span>
                <h2 className={styles.surfaceTitle}>세무 관리 업체</h2>
              </div>
            </div>
            <div className={styles.companyRailList}>
              {props.clients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  className={`${styles.companyRailItem} ${client.id === props.currentClientId ? styles.companyRailItemActive : ""}`}
                  onClick={() => props.setCurrentClientId(client.id)}
                >
                  <div className={styles.companyRailItemTop}>
                    <strong>{client.name}</strong>
                    <span className={`${styles.statusPill} ${statusTone(client.channels.hometax)}`}>
                      {STATUS_LABELS[client.channels.hometax]}
                    </span>
                  </div>
                  <span>홈택스 {STATUS_LABELS[client.channels.hometax]}</span>
                  <span>4대보험 {STATUS_LABELS[client.channels.fourInsure]}</span>
                </button>
              ))}
            </div>
          </aside>

          <div className={styles.boardMain}>
            <section className={styles.boardOverview}>
              <div>
                <span className={styles.sectionEyebrow}>Tax Desk</span>
                <h2 className={styles.surfaceTitle}>{selectedClient?.name ?? "업체 선택"}</h2>
                <p className={styles.boardDescription}>
                  세무회계 탭은 월마감, 원천세, 4대보험 검토 업무를 표 형식으로 추적하도록 구성했습니다.
                </p>
              </div>
              <div className={styles.boardOverviewStats}>
                <div className={styles.boardMetric}>
                  <span>브리지</span>
                  <strong>{props.dataBridgeConnected ? "연결" : "오프라인"}</strong>
                </div>
                <div className={styles.boardMetric}>
                  <span>포트</span>
                  <strong>{props.dataBridgePort ? `:${props.dataBridgePort}` : "-"}</strong>
                </div>
                <div className={styles.boardMetric}>
                  <span>실행</span>
                  <strong>{props.jobs.length}건</strong>
                </div>
              </div>
            </section>

            <div className={styles.taxBoard}>
              <section className={styles.surfaceCard}>
                <div className={styles.boardHeader}>
                  <div>
                    <span className={styles.sectionEyebrow}>Monthly Close</span>
                    <h2 className={styles.surfaceTitle}>월마감 / 보고</h2>
                  </div>
                </div>
                <div className={styles.simpleTable}>
                  <div className={styles.simpleTableHead}>
                    <span>월</span>
                    <span>요약</span>
                    <span>대표 확인</span>
                  </div>
                  {tenantMonthlyReports.map((report) => (
                    <div key={report.id} className={styles.simpleTableRow}>
                      <span>{report.month}</span>
                      <span>{report.summary ?? "-"}</span>
                      <span>{report.owner_confirmed ? "완료" : "대기"}</span>
                    </div>
                  ))}
                  {!tenantMonthlyReports.length ? <p className={styles.emptyState}>월마감 데이터가 없습니다.</p> : null}
                </div>
              </section>

              <section className={styles.surfaceCard}>
                <div className={styles.boardHeader}>
                  <div>
                    <span className={styles.sectionEyebrow}>Tax Tasks</span>
                    <h2 className={styles.surfaceTitle}>세무회계 진행표</h2>
                  </div>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    disabled={props.jobActionKey === "통합 재수집"}
                    onClick={() => props.onRun(["hometax", "fourInsure"], "통합 재수집")}
                  >
                    {props.jobActionKey === "통합 재수집" ? "실행 중..." : "자료 재수집"}
                  </button>
                </div>
                <div className={styles.simpleTable}>
                  <div className={styles.simpleTableHead}>
                    <span>업무</span>
                    <span>카테고리</span>
                    <span>마감일</span>
                    <span>상태</span>
                  </div>
                  {tenantTaxTasks.map((task) => (
                    <div key={task.id} className={styles.simpleTableRow}>
                      <span>{task.title}</span>
                      <span>{task.category}</span>
                      <span>{task.due_date ? formatDate(task.due_date) : "-"}</span>
                      <span>{task.status}</span>
                    </div>
                  ))}
                  {!tenantTaxTasks.length ? <p className={styles.emptyState}>세무회계 작업 데이터가 없습니다.</p> : null}
                </div>
              </section>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function formatDate(value: string) {
  return value.replaceAll("-", ".");
}

function contractStatusLabel(status: string) {
  switch (status) {
    case "draft":
      return "초안";
    case "sent":
      return "발송";
    case "employee_signed":
      return "직원 서명";
    case "fully_signed":
      return "완료";
    case "void":
      return "무효";
    default:
      return status;
  }
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
