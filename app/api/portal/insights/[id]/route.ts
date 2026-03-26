import { NextRequest, NextResponse } from "next/server";
import { portalStore } from "@/lib/server/portal-store";
import { getWorkspaceSession } from "@/lib/workspace-auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getWorkspaceSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const updates: Record<string, unknown> = { ...body };
  if (body.isDraft === false && !body.publishedAt) {
    updates.publishedAt = new Date().toISOString();
  }

  const updated = portalStore.updateInsightPost(params.id, updates);
  if (!updated) return NextResponse.json({ error: "포스트를 찾을 수 없습니다." }, { status: 404 });

  return NextResponse.json({ post: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = getWorkspaceSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  portalStore.deleteInsightPost(params.id);
  return NextResponse.json({ ok: true });
}
