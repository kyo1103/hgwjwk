// ─── ERP 수집 모듈 타입 정의 ────────────────────────────────────────────────

export type ConnectorStatus =
    | "READY"
    | "RUNNING"
    | "SUCCESS"
    | "FAILED"
    | "NEED_LOGIN"
    | "NEED_CONSENT";

export type MandateStatus = "ACTIVE" | "INACTIVE" | "PENDING";

export type ChannelKey = "hometax" | "fourInsure" | "gov24" | "wetax";

export type DocumentType =
    // 홈택스 8종
    | "국세납세증명서"
    | "사업자등록증명"
    | "부가세과세표준증명"
    | "소득금액증명"
    | "표준재무제표증명"
    | "세금계산서합계표"
    | "폐업사실증명"
    | "지방세납세증명서"
    // 4대보험 7종
    | "4대보험가입내역확인서"
    | "건강보험상세조회"
    | "국민연금상세조회"
    | "고용보험상세조회"
    | "산재보험상세조회"
    | "건강보험고지내역"
    | "국민연금고지내역"
    | "기타";

export type AuditActionType =
    | "JOB_REQUESTED"
    | "JOB_STARTED"
    | "JOB_SUCCESS"
    | "JOB_FAILED"
    | "JOB_RETRIED"
    | "DOCUMENT_SAVED"
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILED"
    | "SETTING_CHANGED";

// ─── 수임 사업장 ─────────────────────────────────────────────────────────────

export interface ERPClient {
    id: string;
    name: string;
    bizNo: string;         // 사업자등록번호 (예: 198-86-01580)
    manager: string;       // 담당자명
    mandateStatus: MandateStatus;
    channels: Record<ChannelKey, ConnectorStatus>;
    lastRunAt: string | null;
    lastErrorMessage?: string;
    createdAt: string;
}

// ─── 수집 작업 (Job) ─────────────────────────────────────────────────────────

export interface ERPJob {
    id: string;
    clientId: string;
    scope: ChannelKey[];           // 수집 대상 기관
    bridgeScope?: ChannelKey[];    // 브릿지 에이전트가 실제 실행하는 기관
    status: ConnectorStatus;
    requestedBy: string;           // 요청자 ID
    requestedAt: string;
    startedAt?: string;
    finishedAt?: string;
    resultMessage?: string;
    documents?: string[];          // 생성된 ERPDocument ID 목록
    bridgeJobId?: string;          // 브릿지 에이전트 작업 ID
}

// ─── 수집 문서 ───────────────────────────────────────────────────────────────

export interface ERPDocument {
    id: string;
    clientId: string;
    clientName: string;
    channelKey: ChannelKey;
    documentType: DocumentType;
    baseYm: string;                // 기준연월 (예: 2026-02)
    fileName: string;              // {사업장명}_{기관}_{문서종류}_{기준연월}_{생성일시}.pdf
    filePath: string;              // /archive/{사업자번호}/{기관}/{YYYY}/{MM}/
    downloadUrl?: string;          // 다운로드/미리보기 URL
    createdAt: string;
    jobId: string;
}

// ─── 감사로그 ────────────────────────────────────────────────────────────────

export interface AuditLog {
    id: string;
    actorId: string;
    actorName: string;
    clientId?: string;
    clientName?: string;
    actionType: AuditActionType;
    detail: string;
    createdAt: string;
}

// ─── 에이전트 커넥터 인터페이스 ─────────────────────────────────────────────

export interface RunJobInput {
    clientId: string;
    documentType: DocumentType;
    baseYm?: string;
}

export interface RunJobResult {
    success: boolean;
    status: ConnectorStatus;
    filePath?: string;
    fileName?: string;
    message?: string;
}

export interface AgencyConnector {
    key: ChannelKey;
    displayName: string;
    run(input: RunJobInput): Promise<RunJobResult>;
}

export interface ERPStats {
    totalClients: number;
    todaySuccess: number;
    todayFailed: number;
    todayRunning: number;
    needsAction: number;
}

export interface BridgeAgentStatus {
    connected: boolean;
    url: string;
    checkedAt: string;
    port?: number;
    outputDir?: string;
    runningJobs?: number;
    error?: string;
}

export interface ERPStateSnapshot {
    clients: ERPClient[];
    jobs: ERPJob[];
    documents: ERPDocument[];
    auditLogs: AuditLog[];
    stats: ERPStats;
    bridgeAgent: BridgeAgentStatus;
}

// ─── 채널 표시명 매핑 ────────────────────────────────────────────────────────

export const channelDisplayNames: Record<ChannelKey, string> = {
    hometax: "홈택스",
    fourInsure: "4대보험",
    gov24: "정부24",
    wetax: "위택스",
};

export const statusDisplayNames: Record<ConnectorStatus, string> = {
    READY: "준비",
    RUNNING: "수집중",
    SUCCESS: "완료",
    FAILED: "실패",
    NEED_LOGIN: "로그인필요",
    NEED_CONSENT: "동의필요",
};
