import { NextResponse } from "next/server";
import type { ChannelKey } from "@/lib/erp-types";
import { requestCollectionJob } from "@/lib/server/erp-store";

export async function POST(
    req: Request,
    { params }: { params: { id: string } },
) {
    const body = await req.json().catch(() => ({}));
    const scope: ChannelKey[] = Array.isArray(body.scope) && body.scope.length > 0
        ? body.scope
        : ["hometax", "fourInsure"];

    try {
        const job = await requestCollectionJob({
            clientId: params.id,
            scope,
            requestedBy: body.requestedBy,
            baseYm: body.baseYm,
        });

        return NextResponse.json(job, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ message }, { status: 404 });
    }
}
