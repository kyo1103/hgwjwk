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

  const updates: Record<string, unknown> = {};
  if (body.answer !== undefined) {
    updates.answer = body.answer;
    updates.answeredBy = session.name;
    updates.answeredByRole = session.roleKey;
    updates.status = "완료";
    updates.answeredAt = new Date().toISOString();
  }
  if (body.status) updates.status = body.status;

  const updated = portalStore.updateQnaItem(params.id, updates);
  if (!updated) return NextResponse.json({ error: "Q&A를 찾을 수 없습니다." }, { status: 404 });

  return NextResponse.json({ item: updated });
}
