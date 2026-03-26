import { NextRequest, NextResponse } from "next/server";
import { portalStore } from "@/lib/server/portal-store";
import { getWorkspaceSession } from "@/lib/workspace-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { tenantSlug: string; id: string } }
) {
  const session = getWorkspaceSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  // body: { status?, sendMemo?, action: 'send' | 'update' }
  const updates: Record<string, unknown> = {};

  if (body.sendMemo !== undefined) updates.sendMemo = body.sendMemo;
  if (body.status) updates.status = body.status;
  if (body.action === "send") {
    updates.status = "notice_sent";
    updates.sentAt = new Date().toISOString();
    updates.sentBy = session.name;
  }

  const updated = portalStore.updateTaxPayment(params.id, updates);
  if (!updated) return NextResponse.json({ error: "납부서를 찾을 수 없습니다." }, { status: 404 });

  return NextResponse.json({ payment: updated });
}
