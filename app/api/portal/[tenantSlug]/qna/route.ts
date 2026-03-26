import { NextRequest, NextResponse } from "next/server";
import { portalStore, type QnaItem } from "@/lib/server/portal-store";
import { getWorkspaceSession } from "@/lib/workspace-auth";

export async function GET(_req: NextRequest, { params }: { params: { tenantSlug: string } }) {
  const items = portalStore.getQnaItems(params.tenantSlug);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest, { params }: { params: { tenantSlug: string } }) {
  const session = getWorkspaceSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const item: QnaItem = {
    id: `qa_${Date.now()}`,
    tenantSlug: params.tenantSlug,
    question: body.question,
    askerName: session.name,
    askerRole: session.roleKey,
    answerMode: "전문가 검토",
    status: "답변대기",
    createdAt: new Date().toISOString(),
  };

  portalStore.addQnaItem(item);
  return NextResponse.json({ item }, { status: 201 });
}
