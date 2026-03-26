import { NextResponse } from "next/server";
import { retryCollectionJob } from "@/lib/server/erp-store";

export async function POST(
    req: Request,
    { params }: { params: { id: string } },
) {
    const body = await req.json().catch(() => ({}));

    try {
        const job = await retryCollectionJob(params.id, body.requestedBy);
        return NextResponse.json(job, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ message }, { status: 404 });
    }
}
