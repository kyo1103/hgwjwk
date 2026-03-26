import { NextRequest, NextResponse } from "next/server";
import { portalStore } from "@/lib/server/portal-store";

export async function GET(_req: NextRequest, { params }: { params: { tenantSlug: string } }) {
  const revisions = portalStore.getPayrollRevisions(params.tenantSlug);
  return NextResponse.json({ revisions });
}
