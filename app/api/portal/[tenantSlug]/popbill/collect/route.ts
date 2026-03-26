import { NextRequest, NextResponse } from "next/server";
import { getTenantBySlug } from "@/lib/data";

const BRIDGE_URL = process.env.BRIDGE_URL || "http://127.0.0.1:43115";

/** POST — 팝빌 홈택스 수집 시작 */
export async function POST(
  req: NextRequest,
  { params }: { params: { tenantSlug: string } }
) {
  const tenant = getTenantBySlug(params.tenantSlug);
  if (!tenant) return NextResponse.json({ ok: false, message: "tenant not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const corpNum = String(body.corpNum || "").replace(/-/g, "");
  const baseYm = String(body.baseYm || new Date().toISOString().slice(0, 7).replace("-", ""));

  if (!corpNum || corpNum.length !== 10) {
    return NextResponse.json({ ok: false, message: "corpNum 10자리 사업자번호 필요" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BRIDGE_URL}/popbill/collect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ corpNum, baseYm }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, message: `Bridge 연결 실패: ${message}` }, { status: 503 });
  }
}
