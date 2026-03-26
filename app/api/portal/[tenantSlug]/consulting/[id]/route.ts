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
  const updated = portalStore.updateConsultingProject(params.id, body);
  if (!updated) return NextResponse.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });

  return NextResponse.json({ project: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { tenantSlug: string; id: string } }
) {
  const session = getWorkspaceSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  portalStore.deleteConsultingProject(params.id);
  return NextResponse.json({ ok: true });
}
