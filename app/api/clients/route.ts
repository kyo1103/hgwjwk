import { NextResponse } from "next/server";
import { listClients, syncRunningJobsFromBridge } from "@/lib/server/erp-store";

export const dynamic = "force-dynamic";

export async function GET() {
    await syncRunningJobsFromBridge();
    return NextResponse.json(listClients());
}
