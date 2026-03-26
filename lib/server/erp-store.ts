import path from "path";
import { v4 as uuidv4 } from "uuid";
import { auditLogs as seedAuditLogs, erpClients as seedClients, erpDocuments as seedDocuments, erpJobs as seedJobs } from "@/lib/erp-data";
import type {
    AuditActionType,
    AuditLog,
    BridgeAgentStatus,
    ChannelKey,
    ConnectorStatus,
    DocumentType,
    ERPClient,
    ERPDocument,
    ERPJob,
    ERPStateSnapshot,
    ERPStats,
} from "@/lib/erp-types";
import {
    createBridgeJob,
    getBridgeHealth,
    getBridgeJob,
    getBridgeUrl,
    getSupportedBridgeScope,
    scopeToBridgeProvider,
    type BridgeJobFile,
    type BridgeJobPayload,
} from "@/lib/server/bridge-agent";

interface StoreState {
    clients: ERPClient[];
    jobs: ERPJob[];
    documents: ERPDocument[];
    auditLogs: AuditLog[];
    syncLocks: Set<string>;
}

declare global {
    var __erpStore: StoreState | undefined;
}

function cloneSeed<T>(value: T): T {
    return structuredClone(value);
}

const state =
    globalThis.__erpStore ??
    (globalThis.__erpStore = {
        clients: cloneSeed(seedClients),
        jobs: cloneSeed(seedJobs),
        documents: cloneSeed(seedDocuments),
        auditLogs: cloneSeed(seedAuditLogs),
        syncLocks: new Set<string>(),
    });

function nowIso() {
    return new Date().toISOString();
}

function cloneSnapshot<T>(value: T): T {
    return structuredClone(value);
}

function sortByDateDesc<T>(items: T[], pickDate: (item: T) => string | undefined) {
    return [...items].sort((left, right) => {
        const leftTime = new Date(pickDate(left) || 0).getTime();
        const rightTime = new Date(pickDate(right) || 0).getTime();
        return rightTime - leftTime;
    });
}

function addAuditLog(input: {
    actorId: string;
    actorName: string;
    actionType: AuditActionType;
    detail: string;
    clientId?: string;
    clientName?: string;
}) {
    state.auditLogs.unshift({
        id: uuidv4(),
        createdAt: nowIso(),
        ...input,
    });
}

function getClientById(clientId: string) {
    return state.clients.find((client) => client.id === clientId);
}

function getJobById(jobId: string) {
    return state.jobs.find((job) => job.id === jobId);
}

function setClientChannels(scope: ChannelKey[], client: ERPClient | undefined, status: ConnectorStatus) {
    if (!client) return;
    for (const channel of scope) {
        client.channels[channel] = status;
    }
}

function mapBridgeProviderToChannel(provider: string): ChannelKey {
    return provider === "fourinsure" ? "fourInsure" : "hometax";
}

function mapBridgeDocumentType(bridgeType: string): DocumentType {
    const typeMap: Record<string, DocumentType> = {
        certificate_of_tax_payment: "국세납세증명서",
        business_registration: "사업자등록증명",
        vat_base_certificate: "부가세과세표준증명",
        coverage_statement: "4대보험가입내역확인서",
        premium_payment_statement: "건강보험상세조회",
        health_insurance: "건강보험상세조회",
        national_pension: "국민연금상세조회",
        employment_insurance: "고용보험상세조회",
        industrial_accident: "산재보험상세조회",
    };

    return typeMap[bridgeType] ?? "기타";
}

function toDocumentDirectory(file: BridgeJobFile) {
    const rawPath = file.relativePath || file.url?.replace(/^\/files\//, "") || "";
    const directory = rawPath ? path.posix.dirname(rawPath) : "";
    return directory ? `/${directory}/` : file.url || "";
}

function toDocumentUrl(file: BridgeJobFile) {
    if (!file.url) return undefined;
    return new URL(file.url, getBridgeUrl()).toString();
}

function buildSuccessMessage(job: ERPJob, files: BridgeJobFile[]) {
    const skippedCount = Math.max(0, job.scope.length - (job.bridgeScope?.length || 0));
    if (skippedCount > 0) {
        return `수집 완료: 파일 ${files.length}개 (미지원 기관 ${skippedCount}개 제외)`;
    }
    return `수집 완료: 파일 ${files.length}개`;
}

function finalizeBridgeSuccess(job: ERPJob, bridgeJob: BridgeJobPayload) {
    const client = getClientById(job.clientId);
    const files = bridgeJob.files || [];
    const documentIds: string[] = [];

    for (const file of files) {
        const documentId = uuidv4();
        const document: ERPDocument = {
            id: documentId,
            clientId: job.clientId,
            clientName: client?.name || job.clientId,
            channelKey: mapBridgeProviderToChannel(file.provider),
            documentType: mapBridgeDocumentType(file.documentType),
            baseYm: bridgeJob.company?.baseYm || nowIso().slice(0, 7),
            fileName: file.fileName,
            filePath: toDocumentDirectory(file),
            downloadUrl: toDocumentUrl(file),
            createdAt: file.createdAt || nowIso(),
            jobId: job.id,
        };

        documentIds.push(documentId);
        state.documents.unshift(document);

        addAuditLog({
            actorId: "system",
            actorName: "시스템",
            clientId: job.clientId,
            clientName: client?.name,
            actionType: "DOCUMENT_SAVED",
            detail: `문서 저장: ${document.fileName}`,
        });
    }

    job.status = "SUCCESS";
    job.finishedAt = bridgeJob.finishedAt || nowIso();
    job.documents = documentIds;
    job.resultMessage = buildSuccessMessage(job, files);

    const targetScope = job.bridgeScope?.length ? job.bridgeScope : job.scope;
    setClientChannels(targetScope, client, "SUCCESS");
    if (client) {
        client.lastRunAt = job.finishedAt;
        client.lastErrorMessage = undefined;
    }

    addAuditLog({
        actorId: "system",
        actorName: "시스템",
        clientId: job.clientId,
        clientName: client?.name,
        actionType: "JOB_SUCCESS",
        detail: job.resultMessage,
    });
}

function finalizeBridgeFailure(job: ERPJob, message: string) {
    const client = getClientById(job.clientId);
    job.status = "FAILED";
    job.finishedAt = nowIso();
    job.resultMessage = message;

    const targetScope = job.bridgeScope?.length ? job.bridgeScope : job.scope;
    setClientChannels(targetScope, client, "FAILED");
    if (client) {
        client.lastErrorMessage = message;
    }

    addAuditLog({
        actorId: "system",
        actorName: "시스템",
        clientId: job.clientId,
        clientName: client?.name,
        actionType: "JOB_FAILED",
        detail: message,
    });
}

async function syncJobFromBridge(jobId: string) {
    const job = getJobById(jobId);
    if (!job || job.status !== "RUNNING" || !job.bridgeJobId) return;
    if (state.syncLocks.has(jobId)) return;

    state.syncLocks.add(jobId);
    try {
        const bridgeJob = await getBridgeJob(job.bridgeJobId);

        if (job.status !== "RUNNING") return;
        if (bridgeJob.status === "done") {
            finalizeBridgeSuccess(job, bridgeJob);
            return;
        }

        if (bridgeJob.status === "failed") {
            finalizeBridgeFailure(job, bridgeJob.error || "Bridge agent job failed.");
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.toLowerCase().includes("not found")) {
            finalizeBridgeFailure(job, "Bridge agent job not found.");
        }
    } finally {
        state.syncLocks.delete(jobId);
    }
}

export async function syncRunningJobsFromBridge() {
    const runningJobs = state.jobs
        .filter((job) => job.status === "RUNNING" && job.bridgeJobId)
        .map((job) => job.id);

    await Promise.all(runningJobs.map((jobId) => syncJobFromBridge(jobId)));
}

export async function requestCollectionJob(input: {
    clientId: string;
    scope: ChannelKey[];
    requestedBy?: string;
    baseYm?: string;
}) {
    const client = getClientById(input.clientId);
    if (!client) {
        throw new Error("Client not found");
    }

    const scope: ChannelKey[] = input.scope.length > 0 ? input.scope : ["hometax", "fourInsure"];
    const bridgeScope = getSupportedBridgeScope(scope);
    const createdAt = nowIso();

    const job: ERPJob = {
        id: uuidv4(),
        clientId: client.id,
        scope,
        bridgeScope,
        status: "RUNNING",
        requestedBy: input.requestedBy || "u1",
        requestedAt: createdAt,
        startedAt: createdAt,
    };

    state.jobs.unshift(job);
    setClientChannels(bridgeScope, client, "RUNNING");
    client.lastErrorMessage = undefined;

    addAuditLog({
        actorId: job.requestedBy,
        actorName: "이세무",
        clientId: client.id,
        clientName: client.name,
        actionType: "JOB_REQUESTED",
        detail: `수집 작업 요청: ${scope.join(", ")}`,
    });

    if (bridgeScope.length === 0) {
        finalizeBridgeFailure(job, "선택한 기관은 아직 브리지 에이전트에서 지원하지 않습니다.");
        return cloneSnapshot(job);
    }

    const provider = scopeToBridgeProvider(bridgeScope);
    if (!provider) {
        finalizeBridgeFailure(job, "브리지 에이전트 provider 매핑에 실패했습니다.");
        return cloneSnapshot(job);
    }

    try {
        const bridgeJob = await createBridgeJob({
            provider,
            company: {
                name: client.name,
                bizNo: client.bizNo,
                manager: client.manager,
                baseYm: input.baseYm || nowIso().slice(0, 7),
            },
        });

        job.bridgeJobId = bridgeJob.jobId;
        addAuditLog({
            actorId: "system",
            actorName: "시스템",
            clientId: client.id,
            clientName: client.name,
            actionType: "JOB_STARTED",
            detail: `브리지 작업 시작: ${bridgeJob.jobId}`,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        finalizeBridgeFailure(job, `브리지 에이전트 연결 실패: ${message}`);
    }

    return cloneSnapshot(job);
}

export async function retryCollectionJob(jobId: string, requestedBy?: string) {
    const targetJob = getJobById(jobId);
    if (!targetJob) {
        throw new Error("Job not found");
    }

    const client = getClientById(targetJob.clientId);
    addAuditLog({
        actorId: requestedBy || "u1",
        actorName: "이세무",
        clientId: targetJob.clientId,
        clientName: client?.name,
        actionType: "JOB_RETRIED",
        detail: `재시도 요청: ${targetJob.id}`,
    });

    return requestCollectionJob({
        clientId: targetJob.clientId,
        scope: targetJob.scope,
        requestedBy: requestedBy || targetJob.requestedBy,
    });
}

export function listClients() {
    return cloneSnapshot(state.clients);
}

export function listJobs() {
    return cloneSnapshot(sortByDateDesc(state.jobs, (job) => job.requestedAt));
}

export function listDocuments() {
    return cloneSnapshot(sortByDateDesc(state.documents, (document) => document.createdAt));
}

export function listAuditLogs() {
    return cloneSnapshot(sortByDateDesc(state.auditLogs, (log) => log.createdAt));
}

export function getClient(clientId: string) {
    const client = getClientById(clientId);
    return client ? cloneSnapshot(client) : null;
}

export function getJob(jobId: string) {
    const job = getJobById(jobId);
    return job ? cloneSnapshot(job) : null;
}

export function getStats(): ERPStats {
    const today = nowIso().slice(0, 10);
    const todayJobs = state.jobs.filter((job) => job.requestedAt.startsWith(today));

    return {
        totalClients: state.clients.filter((client) => client.mandateStatus === "ACTIVE").length,
        todaySuccess: todayJobs.filter((job) => job.status === "SUCCESS").length,
        todayFailed: todayJobs.filter((job) => job.status === "FAILED" || job.status === "NEED_LOGIN" || job.status === "NEED_CONSENT").length,
        todayRunning: todayJobs.filter((job) => job.status === "RUNNING").length,
        needsAction: state.clients.filter((client) =>
            Object.values(client.channels).some((status) => status === "FAILED" || status === "NEED_LOGIN" || status === "NEED_CONSENT"),
        ).length,
    };
}

export async function getStateSnapshot(): Promise<ERPStateSnapshot> {
    const bridgeAgent: BridgeAgentStatus = await getBridgeHealth();

    return {
        clients: listClients(),
        jobs: listJobs(),
        documents: listDocuments(),
        auditLogs: listAuditLogs(),
        stats: getStats(),
        bridgeAgent,
    };
}
