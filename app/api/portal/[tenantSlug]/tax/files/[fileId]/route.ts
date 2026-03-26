import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { portalStore } from "@/lib/server/portal-store";
import { getWorkspaceSession } from "@/lib/workspace-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { tenantSlug: string; fileId: string } }
) {
  const session = getWorkspaceSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { reviewStatus } = body as { reviewStatus: "pending" | "reviewing" | "done" };

  const updated = portalStore.updateTaxFileReview(params.fileId, reviewStatus, session.name);
  if (!updated) return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });

  return NextResponse.json({ file: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { tenantSlug: string; fileId: string } }
) {
  const session = getWorkspaceSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const files = portalStore.getTaxFiles(params.tenantSlug);
  const file = files.find((f) => f.id === params.fileId);
  if (!file) return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });

  try {
    await unlink(file.filePath);
  } catch {
    // 파일이 이미 없어도 레코드는 삭제
  }

  portalStore.deleteTaxFile(params.fileId);
  return NextResponse.json({ ok: true });
}
