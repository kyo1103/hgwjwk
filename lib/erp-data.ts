import type {
    ERPClient,
    ERPJob,
    ERPDocument,
    AuditLog,
    ChannelKey,
    DocumentType,
    ConnectorStatus,
} from "./erp-types";

// ─── 수임 사업장 목업 데이터 ─────────────────────────────────────────────────

export const erpClients: ERPClient[] = [
    {
        id: "c1",
        name: "유니온테크 주식회사",
        bizNo: "198-86-01580",
        manager: "이자영",
        mandateStatus: "ACTIVE",
        channels: {
            hometax: "SUCCESS",
            fourInsure: "SUCCESS",
            gov24: "READY",
            wetax: "NEED_LOGIN",
        },
        lastRunAt: "2026-03-09T09:15:00.000Z",
        createdAt: "2025-12-01T00:00:00.000Z",
    },
    {
        id: "c2",
        name: "OOO의원",
        bizNo: "123-45-67890",
        manager: "박대표",
        mandateStatus: "ACTIVE",
        channels: {
            hometax: "SUCCESS",
            fourInsure: "RUNNING",
            gov24: "READY",
            wetax: "READY",
        },
        lastRunAt: "2026-03-09T10:30:00.000Z",
        createdAt: "2026-01-15T00:00:00.000Z",
    },
    {
        id: "c3",
        name: "스타트업코리아 (주)",
        bizNo: "345-67-89012",
        manager: "최정훈",
        mandateStatus: "ACTIVE",
        channels: {
            hometax: "FAILED",
            fourInsure: "READY",
            gov24: "NEED_CONSENT",
            wetax: "READY",
        },
        lastRunAt: "2026-03-08T14:20:00.000Z",
        lastErrorMessage: "홈택스 인증 세션 만료 — 재로그인 필요",
        createdAt: "2026-02-01T00:00:00.000Z",
    },
    {
        id: "c4",
        name: "한국물류 (주)",
        bizNo: "456-78-90123",
        manager: "김민준",
        mandateStatus: "ACTIVE",
        channels: {
            hometax: "READY",
            fourInsure: "NEED_LOGIN",
            gov24: "READY",
            wetax: "READY",
        },
        lastRunAt: null,
        createdAt: "2026-02-20T00:00:00.000Z",
    },
    {
        id: "c5",
        name: "그린에너지 협동조합",
        bizNo: "567-89-01234",
        manager: "이세무",
        mandateStatus: "INACTIVE",
        channels: {
            hometax: "READY",
            fourInsure: "READY",
            gov24: "READY",
            wetax: "READY",
        },
        lastRunAt: null,
        createdAt: "2026-01-10T00:00:00.000Z",
    },
];

// ─── 수집 작업 목업 데이터 ───────────────────────────────────────────────────

export const erpJobs: ERPJob[] = [
    {
        id: "j1",
        clientId: "c1",
        scope: ["hometax", "fourInsure"],
        status: "SUCCESS",
        requestedBy: "u1",
        requestedAt: "2026-03-09T09:00:00.000Z",
        startedAt: "2026-03-09T09:01:00.000Z",
        finishedAt: "2026-03-09T09:15:00.000Z",
        resultMessage: "홈택스 3건, 4대보험 2건 수집 완료",
        documents: ["doc1", "doc2", "doc3", "doc4", "doc5"],
    },
    {
        id: "j2",
        clientId: "c2",
        scope: ["fourInsure"],
        status: "RUNNING",
        requestedBy: "u1",
        requestedAt: "2026-03-09T10:25:00.000Z",
        startedAt: "2026-03-09T10:30:00.000Z",
    },
    {
        id: "j3",
        clientId: "c3",
        scope: ["hometax"],
        status: "FAILED",
        requestedBy: "u2",
        requestedAt: "2026-03-08T14:10:00.000Z",
        startedAt: "2026-03-08T14:12:00.000Z",
        finishedAt: "2026-03-08T14:20:00.000Z",
        resultMessage: "홈택스 인증 세션 만료 — 재로그인 필요",
    },
    {
        id: "j4",
        clientId: "c1",
        scope: ["hometax", "fourInsure", "gov24", "wetax"],
        status: "SUCCESS",
        requestedBy: "u1",
        requestedAt: "2026-03-07T09:00:00.000Z",
        startedAt: "2026-03-07T09:02:00.000Z",
        finishedAt: "2026-03-07T09:40:00.000Z",
        resultMessage: "전 기관 수집 완료 (8건)",
        documents: ["doc6", "doc7", "doc8"],
    },
    {
        id: "j5",
        clientId: "c4",
        scope: ["hometax"],
        status: "NEED_LOGIN",
        requestedBy: "u1",
        requestedAt: "2026-03-09T11:00:00.000Z",
        startedAt: "2026-03-09T11:01:00.000Z",
        finishedAt: "2026-03-09T11:02:00.000Z",
        resultMessage: "4대보험 포털 로그인이 필요합니다",
    },
];

// ─── 수집 문서 목업 데이터 ───────────────────────────────────────────────────

function makePdfName(clientName: string, channel: string, docType: string, ym: string, ts: string) {
    const d = new Date(ts);
    const dateStr = d.toISOString().replace(/[-:T]/g, "").slice(0, 14);
    return `${clientName}_${channel}_${docType}_${ym}_${dateStr}.pdf`;
}

export const erpDocuments: ERPDocument[] = [
    {
        id: "doc1",
        clientId: "c1",
        clientName: "유니온테크 주식회사",
        channelKey: "hometax",
        documentType: "국세납세증명서",
        baseYm: "2026-02",
        fileName: makePdfName("유니온테크", "홈택스", "국세납세증명서", "2026-02", "2026-03-09T09:05:00.000Z"),
        filePath: "/archive/198-86-01580/hometax/2026/03/",
        createdAt: "2026-03-09T09:05:00.000Z",
        jobId: "j1",
    },
    {
        id: "doc2",
        clientId: "c1",
        clientName: "유니온테크 주식회사",
        channelKey: "hometax",
        documentType: "사업자등록증명",
        baseYm: "2026-02",
        fileName: makePdfName("유니온테크", "홈택스", "사업자등록증명", "2026-02", "2026-03-09T09:07:00.000Z"),
        filePath: "/archive/198-86-01580/hometax/2026/03/",
        createdAt: "2026-03-09T09:07:00.000Z",
        jobId: "j1",
    },
    {
        id: "doc3",
        clientId: "c1",
        clientName: "유니온테크 주식회사",
        channelKey: "hometax",
        documentType: "부가세과세표준증명",
        baseYm: "2026-02",
        fileName: makePdfName("유니온테크", "홈택스", "부가세과세표준증명", "2026-02", "2026-03-09T09:09:00.000Z"),
        filePath: "/archive/198-86-01580/hometax/2026/03/",
        createdAt: "2026-03-09T09:09:00.000Z",
        jobId: "j1",
    },
    {
        id: "doc4",
        clientId: "c1",
        clientName: "유니온테크 주식회사",
        channelKey: "fourInsure",
        documentType: "4대보험가입내역확인서",
        baseYm: "2026-02",
        fileName: makePdfName("유니온테크", "4대보험", "4대보험가입내역확인서", "2026-02", "2026-03-09T09:12:00.000Z"),
        filePath: "/archive/198-86-01580/fourInsure/2026/03/",
        createdAt: "2026-03-09T09:12:00.000Z",
        jobId: "j1",
    },
    {
        id: "doc5",
        clientId: "c1",
        clientName: "유니온테크 주식회사",
        channelKey: "fourInsure",
        documentType: "건강보험상세조회",
        baseYm: "2026-02",
        fileName: makePdfName("유니온테크", "4대보험", "건강보험상세조회", "2026-02", "2026-03-09T09:14:00.000Z"),
        filePath: "/archive/198-86-01580/fourInsure/2026/03/",
        createdAt: "2026-03-09T09:14:00.000Z",
        jobId: "j1",
    },
    {
        id: "doc6",
        clientId: "c1",
        clientName: "유니온테크 주식회사",
        channelKey: "hometax",
        documentType: "국세납세증명서",
        baseYm: "2026-01",
        fileName: makePdfName("유니온테크", "홈택스", "국세납세증명서", "2026-01", "2026-03-07T09:10:00.000Z"),
        filePath: "/archive/198-86-01580/hometax/2026/03/",
        createdAt: "2026-03-07T09:10:00.000Z",
        jobId: "j4",
    },
    {
        id: "doc7",
        clientId: "c1",
        clientName: "유니온테크 주식회사",
        channelKey: "fourInsure",
        documentType: "국민연금상세조회",
        baseYm: "2026-01",
        fileName: makePdfName("유니온테크", "4대보험", "국민연금상세조회", "2026-01", "2026-03-07T09:20:00.000Z"),
        filePath: "/archive/198-86-01580/fourInsure/2026/03/",
        createdAt: "2026-03-07T09:20:00.000Z",
        jobId: "j4",
    },
    {
        id: "doc8",
        clientId: "c1",
        clientName: "유니온테크 주식회사",
        channelKey: "wetax",
        documentType: "기타",
        baseYm: "2026-01",
        fileName: makePdfName("유니온테크", "위택스", "지방세납세증명서", "2026-01", "2026-03-07T09:35:00.000Z"),
        filePath: "/archive/198-86-01580/wetax/2026/03/",
        createdAt: "2026-03-07T09:35:00.000Z",
        jobId: "j4",
    },
];

// ─── 감사로그 목업 데이터 ────────────────────────────────────────────────────

export const auditLogs: AuditLog[] = [
    {
        id: "al1",
        actorId: "u1",
        actorName: "이세무",
        clientId: "c1",
        clientName: "유니온테크 주식회사",
        actionType: "JOB_REQUESTED",
        detail: "수집 작업 요청: hometax, fourInsure",
        createdAt: "2026-03-09T09:00:00.000Z",
    },
    {
        id: "al2",
        actorId: "system",
        actorName: "시스템",
        clientId: "c1",
        clientName: "유니온테크 주식회사",
        actionType: "JOB_STARTED",
        detail: "에이전트 작업 시작 (j1)",
        createdAt: "2026-03-09T09:01:00.000Z",
    },
    {
        id: "al3",
        actorId: "system",
        actorName: "시스템",
        clientId: "c1",
        clientName: "유니온테크 주식회사",
        actionType: "DOCUMENT_SAVED",
        detail: "국세납세증명서 저장 완료: doc1",
        createdAt: "2026-03-09T09:05:00.000Z",
    },
    {
        id: "al4",
        actorId: "system",
        actorName: "시스템",
        clientId: "c1",
        clientName: "유니온테크 주식회사",
        actionType: "JOB_SUCCESS",
        detail: "수집 완료: 홈택스 3건, 4대보험 2건",
        createdAt: "2026-03-09T09:15:00.000Z",
    },
    {
        id: "al5",
        actorId: "u1",
        actorName: "이세무",
        clientId: "c2",
        clientName: "OOO의원",
        actionType: "JOB_REQUESTED",
        detail: "수집 작업 요청: fourInsure",
        createdAt: "2026-03-09T10:25:00.000Z",
    },
    {
        id: "al6",
        actorId: "u2",
        actorName: "김노무",
        clientId: "c3",
        clientName: "스타트업코리아 (주)",
        actionType: "JOB_REQUESTED",
        detail: "수집 작업 요청: hometax",
        createdAt: "2026-03-08T14:10:00.000Z",
    },
    {
        id: "al7",
        actorId: "system",
        actorName: "시스템",
        clientId: "c3",
        clientName: "스타트업코리아 (주)",
        actionType: "JOB_FAILED",
        detail: "홈택스 인증 세션 만료 — 재로그인 필요",
        createdAt: "2026-03-08T14:20:00.000Z",
    },
    {
        id: "al8",
        actorId: "u1",
        actorName: "이세무",
        clientId: "c1",
        clientName: "유니온테크 주식회사",
        actionType: "JOB_REQUESTED",
        detail: "전 기관 일괄 수집 요청: hometax, fourInsure, gov24, wetax",
        createdAt: "2026-03-07T09:00:00.000Z",
    },
    {
        id: "al9",
        actorId: "system",
        actorName: "시스템",
        clientId: "c1",
        clientName: "유니온테크 주식회사",
        actionType: "JOB_SUCCESS",
        detail: "전 기관 수집 완료 (8건)",
        createdAt: "2026-03-07T09:40:00.000Z",
    },
    {
        id: "al10",
        actorId: "u1",
        actorName: "이세무",
        clientId: "c4",
        clientName: "한국물류 (주)",
        actionType: "JOB_REQUESTED",
        detail: "수집 작업 요청: hometax",
        createdAt: "2026-03-09T11:00:00.000Z",
    },
    {
        id: "al11",
        actorId: "system",
        actorName: "시스템",
        clientId: "c4",
        clientName: "한국물류 (주)",
        actionType: "LOGIN_FAILED",
        detail: "4대보험 포털 로그인 실패 — NEED_LOGIN 상태로 전환",
        createdAt: "2026-03-09T11:02:00.000Z",
    },
];

// ─── 헬퍼 함수 ──────────────────────────────────────────────────────────────

export const getClientById = (id: string): ERPClient | undefined =>
    erpClients.find((c) => c.id === id);

export const getJobsByClientId = (clientId: string): ERPJob[] =>
    erpJobs.filter((j) => j.clientId === clientId);

export const getDocumentsByClientId = (clientId: string): ERPDocument[] =>
    erpDocuments.filter((d) => d.clientId === clientId);

export const getAuditLogsByClientId = (clientId: string): AuditLog[] =>
    auditLogs.filter((l) => l.clientId === clientId);

export const getTodayStats = () => {
    const today = new Date().toISOString().slice(0, 10);
    const todayJobs = erpJobs.filter((j) => j.requestedAt.startsWith(today));
    return {
        totalClients: erpClients.filter((c) => c.mandateStatus === "ACTIVE").length,
        todaySuccess: todayJobs.filter((j) => j.status === "SUCCESS").length,
        todayFailed: todayJobs.filter((j) => j.status === "FAILED" || j.status === "NEED_LOGIN" || j.status === "NEED_CONSENT").length,
        todayRunning: todayJobs.filter((j) => j.status === "RUNNING").length,
        needsAction: erpClients.filter((c) =>
            Object.values(c.channels).some((s) => s === "FAILED" || s === "NEED_LOGIN" || s === "NEED_CONSENT")
        ).length,
    };
};
