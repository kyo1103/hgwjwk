import { NextRequest, NextResponse } from "next/server";
import { portalStore } from "@/lib/server/portal-store";
import { getWorkspaceSession } from "@/lib/workspace-auth";

export async function GET(_req: NextRequest, { params }: { params: { tenantSlug: string } }) {
  const info = portalStore.getCompanyInfo(params.tenantSlug);
  return NextResponse.json({ info });
}

export async function PATCH(req: NextRequest, { params }: { params: { tenantSlug: string } }) {
  const session = getWorkspaceSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const updated = portalStore.updateCompanyInfo(params.tenantSlug, body);
  return NextResponse.json({ info: updated });
}
