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
  const updates: Record<string, unknown> = { ...body };
  if (body.leftAt) updates.status = "inactive";

  const updated = portalStore.updateEmployee(params.id, updates);
  if (!updated) return NextResponse.json({ error: "사원을 찾을 수 없습니다." }, { status: 404 });

  // 수정 히스토리
  portalStore.addPayrollRevision({
    id: `pr_${Date.now()}`,
    tenantSlug: params.tenantSlug,
    yearMonth: new Date().toISOString().slice(0, 7),
    description: `${updated.name} 정보 수정`,
    changedBy: session.name,
    changedByRole: session.roleKey,
    visibility: "고객사 표시",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ employee: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { tenantSlug: string; id: string } }
) {
  const session = getWorkspaceSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  portalStore.deleteEmployee(params.id);
  return NextResponse.json({ ok: true });
}
