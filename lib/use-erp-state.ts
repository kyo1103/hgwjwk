"use client";

import { useEffect, useState } from "react";
import type { ERPStateSnapshot } from "@/lib/erp-types";

const DEFAULT_POLL_INTERVAL = 2000;

export function useERPState(pollInterval = DEFAULT_POLL_INTERVAL) {
    const [data, setData] = useState<ERPStateSnapshot | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function refresh() {
        try {
            const response = await fetch("/api/erp/state", { cache: "no-store" });
            if (!response.ok) {
                throw new Error(`Failed to load ERP state: ${response.status}`);
            }

            const next = (await response.json()) as ERPStateSnapshot;
            setData(next);
            setError(null);
        } catch (nextError) {
            setError(nextError instanceof Error ? nextError.message : String(nextError));
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout> | undefined;

        const tick = async () => {
            if (cancelled) return;
            await refresh();
            if (!cancelled) {
                timer = setTimeout(tick, pollInterval);
            }
        };

        void tick();

        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
        };
    }, [pollInterval]);

    return { data, isLoading, error, refresh };
}
