import { NextRequest, NextResponse } from "next/server";
import { portalStore, type PortalEmployee } from "@/lib/server/portal-store";
import { getWorkspaceSession } from "@/lib/workspace-auth";

export async function GET(_req: NextRequest, { params }: { params: { tenantSlug: string } }) {
  const employees = portalStore.getEmployees(params.tenantSlug);
  return NextResponse.json({ employees });
}

export async function POST(req: NextRequest, { params }: { params: { tenantSlug: string } }) {
  const session = getWorkspaceSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const now = new Date().toISOString();
  const emp: PortalEmployee = {
    id: `pe_${Date.now()}`,
    tenantSlug: params.tenantSlug,
    name: body.name,
    employmentType: body.employmentType ?? "regular",
    baseSalary: Number(body.baseSalary) ?? 0,
    joinedAt: body.joinedAt,
    leftAt: body.leftAt ?? undefined,
    status: body.leftAt ? "inactive" : "active",
    position: body.position ?? "",
    department: body.department ?? "",
    dependents: body.dependents ?? "-",
    note: body.note ?? "",
    createdAt: now,
    updatedAt: now,
  };

  // 수정 히스토리 기록
  portalStore.addPayrollRevision({
    id: `pr_${Date.now()}`,
    tenantSlug: params.tenantSlug,
    yearMonth: new Date().toISOString().slice(0, 7),
    description: `${emp.name} 사원 등록`,
    changedBy: session.name,
    changedByRole: session.roleKey,
    visibility: "고객사 표시",
    createdAt: now,
  });

  portalStore.addEmployee(emp);
  return NextResponse.json({ employee: emp }, { status: 201 });
}
