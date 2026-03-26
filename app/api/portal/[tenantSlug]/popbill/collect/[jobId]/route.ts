import { NextRequest, NextResponse } from "next/server";

const BRIDGE_URL = process.env.BRIDGE_URL || "http://127.0.0.1:43115";

/** GET — 수집 작업 상태 조회 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { tenantSlug: string; jobId: string } }
) {
  try {
    const res = await fetch(`${BRIDGE_URL}/popbill/collect/${params.jobId}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, message: `Bridge 연결 실패: ${message}` }, { status: 503 });
  }
}
