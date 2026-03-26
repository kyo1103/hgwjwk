import { NextResponse } from "next/server";
import { listDocuments, syncRunningJobsFromBridge } from "@/lib/server/erp-store";

export const dynamic = "force-dynamic";

export async function GET(
    _req: Request,
    { params }: { params: { id: string } },
) {
    await syncRunningJobsFromBridge();
    const docs = listDocuments().filter((d) => d.clientId === params.id);
    return NextResponse.json(docs);
}
