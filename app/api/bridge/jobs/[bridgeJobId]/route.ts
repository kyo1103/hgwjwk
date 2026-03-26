import { NextResponse } from "next/server";

const BRIDGE_URL = process.env.BRIDGE_URL || "http://127.0.0.1:43115";

export async function GET(
    _req: Request,
    { params }: { params: { bridgeJobId: string } },
) {
    try {
        const res = await fetch(`${BRIDGE_URL}/jobs/${params.bridgeJobId}`, {
            signal: AbortSignal.timeout(5000),
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json(
            { ok: false, error: "브릿지 에이전트에 연결할 수 없습니다" },
            { status: 503 },
        );
    }
}
