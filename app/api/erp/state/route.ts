import { NextResponse } from "next/server";
import { getStateSnapshot, syncRunningJobsFromBridge } from "@/lib/server/erp-store";

export const dynamic = "force-dynamic";

export async function GET() {
    await syncRunningJobsFromBridge();
    const snapshot = await getStateSnapshot();
    return NextResponse.json(snapshot);
}
