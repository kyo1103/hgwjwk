import { NextRequest, NextResponse } from "next/server";
import { portalStore, type ConsultingProject } from "@/lib/server/portal-store";
import { getWorkspaceSession } from "@/lib/workspace-auth";

export async function GET(_req: NextRequest, { params }: { params: { tenantSlug: string } }) {
  const projects = portalStore.getConsultingProjects(params.tenantSlug);
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest, { params }: { params: { tenantSlug: string } }) {
  const session = getWorkspaceSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const now = new Date().toISOString();
  const proj: ConsultingProject = {
    id: `cp_${Date.now()}`,
    tenantSlug: params.tenantSlug,
    name: body.name,
    category: body.category ?? "기타",
    lead: body.lead ?? session.name,
    progress: Number(body.progress) ?? 0,
    stage: body.stage ?? "자료수집 대기",
    description: body.description ?? "",
    startDate: body.startDate ?? new Date().toISOString().slice(0, 10),
    endDate: body.endDate ?? undefined,
    status: "collecting",
    createdAt: now,
    updatedAt: now,
  };

  portalStore.addConsultingProject(proj);
  return NextResponse.json({ project: proj }, { status: 201 });
}
