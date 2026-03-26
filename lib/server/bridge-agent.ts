import type { BridgeAgentStatus, ChannelKey } from "@/lib/erp-types";

const BRIDGE_URL = process.env.BRIDGE_URL || "http://127.0.0.1:43115";

export interface BridgeJobFile {
    provider: string;
    documentType: string;
    fileName: string;
    absolutePath?: string;
    relativePath?: string;
    url?: string;
    createdAt?: string;
}

export interface BridgeJobPayload {
    id: string;
    status: "queued" | "running" | "done" | "failed";
    provider: string;
    company?: {
        name?: string;
        bizNo?: string;
        manager?: string;
        baseYm?: string;
    };
    files?: BridgeJobFile[];
    logs?: string[];
    error?: string;
    createdAt?: string;
    finishedAt?: string;
    updatedAt?: string;
}

function withTimeout(init: RequestInit | undefined, timeoutMs: number): RequestInit {
    return {
        ...init,
        cache: "no-store",
        signal: init?.signal ?? AbortSignal.timeout(timeoutMs),
    };
}

async function readJson<T>(pathname: string, init?: RequestInit, timeoutMs = 8000): Promise<T> {
    const response = await fetch(`${BRIDGE_URL}${pathname}`, withTimeout(init, timeoutMs));
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
        throw new Error(data?.message || `${response.status} ${response.statusText}`);
    }

    return data as T;
}

export function getBridgeUrl() {
    return BRIDGE_URL;
}

export function getSupportedBridgeScope(scope: ChannelKey[]): ChannelKey[] {
    return scope.filter((channel) => channel === "hometax" || channel === "fourInsure");
}

export function scopeToBridgeProvider(scope: ChannelKey[]) {
    const keys = [...new Set(getSupportedBridgeScope(scope))].sort();

    if (keys.length === 0) return null;
    if (keys.length === 1 && keys[0] === "hometax") return "hometax";
    if (keys.length === 1 && keys[0] === "fourInsure") return "fourinsure";
    return "bundle";
}

export async function getBridgeHealth(): Promise<BridgeAgentStatus> {
    try {
        const data = await readJson<{
            ok: boolean;
            port: number;
            outputDir: string;
            runningJobs: number;
        }>("/health", undefined, 5000);

        return {
            connected: true,
            url: BRIDGE_URL,
            checkedAt: new Date().toISOString(),
            port: data.port,
            outputDir: data.outputDir,
            runningJobs: data.runningJobs,
        };
    } catch (error) {
        return {
            connected: false,
            url: BRIDGE_URL,
            checkedAt: new Date().toISOString(),
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

export async function createBridgeJob(input: {
    provider: string;
    company: {
        name: string;
        bizNo: string;
        manager?: string;
        baseYm?: string;
    };
}) {
    const data = await readJson<{ ok: boolean; jobId?: string; message?: string }>(
        "/jobs",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
        },
        10000,
    );

    if (!data.ok || !data.jobId) {
        throw new Error(data.message || "Bridge agent returned an invalid response.");
    }

    return { jobId: data.jobId };
}

export async function getBridgeJob(jobId: string) {
    const data = await readJson<{ ok: boolean; job?: BridgeJobPayload; message?: string }>(
        `/jobs/${jobId}`,
        undefined,
        7000,
    );

    if (!data.ok || !data.job) {
        throw new Error(data.message || "Bridge job was not found.");
    }

    return data.job;
}
