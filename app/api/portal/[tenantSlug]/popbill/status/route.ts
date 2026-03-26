import { NextResponse } from "next/server";

const BRIDGE_URL = process.env.BRIDGE_URL || "http://127.0.0.1:43115";

/** GET — 팝빌 연동 활성화 상태 확인 */
export async function GET() {
  try {
    const res = await fetch(`${BRIDGE_URL}/popbill/status`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ ok: false, enabled: false, message: "Bridge 오프라인" }, { status: 503 });
  }
}
