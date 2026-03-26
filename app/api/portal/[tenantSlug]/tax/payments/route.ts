import { NextRequest, NextResponse } from "next/server";
import { portalStore, type TaxPaymentRecord } from "@/lib/server/portal-store";
import { getWorkspaceSession } from "@/lib/workspace-auth";

export async function GET(_req: NextRequest, { params }: { params: { tenantSlug: string } }) {
  const payments = portalStore.getTaxPayments(params.tenantSlug);
  return NextResponse.json({ payments });
}

export async function POST(req: NextRequest, { params }: { params: { tenantSlug: string } }) {
  const session = getWorkspaceSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const rec: TaxPaymentRecord = {
    id: `tp_${Date.now()}`,
    tenantSlug: params.tenantSlug,
    taxType: body.taxType,
    dueDate: body.dueDate,
    status: "pending",
    sendMemo: body.sendMemo ?? "",
  };
  portalStore.addTaxPayment(rec);
  return NextResponse.json({ payment: rec }, { status: 201 });
}
