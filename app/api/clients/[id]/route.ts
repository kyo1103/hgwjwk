import { NextResponse } from "next/server";
import { getClient, syncRunningJobsFromBridge } from "@/lib/server/erp-store";

export const dynamic = "force-dynamic";

export async function GET(
    _req: Request,
    { params }: { params: { id: string } },
) {
    await syncRunningJobsFromBridge();
    const client = getClient(params.id);
    if (!client) return NextResponse.json({ message: "Client not found" }, { status: 404 });
    return NextResponse.json(client);
}
