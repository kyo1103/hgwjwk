import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { portalStore, type TaxFile } from "@/lib/server/portal-store";
import { getWorkspaceSession } from "@/lib/workspace-auth";

const CATEGORY_LABELS: Record<string, string> = {
  assets: "자산",
  liabilities: "부채",
  financial: "금융",
  manual: "수기증빙",
};

export async function GET(_req: NextRequest, { params }: { params: { tenantSlug: string } }) {
  const files = portalStore.getTaxFiles(params.tenantSlug);
  return NextResponse.json({ files });
}

export async function POST(req: NextRequest, { params }: { params: { tenantSlug: string } }) {
  const session = getWorkspaceSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const category = (formData.get("category") as string) ?? "manual";

  if (!file) return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });

  const uploadsDir = path.join(process.cwd(), "uploads", "portal", params.tenantSlug, "tax", category);
  await mkdir(uploadsDir, { recursive: true });

  const ext = file.name.split(".").pop() ?? "bin";
  const id = `tf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const fileName = `${id}.${ext}`;
  const filePath = path.join(uploadsDir, fileName);

  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  const record: TaxFile = {
    id,
    tenantSlug: params.tenantSlug,
    category: category as TaxFile["category"],
    categoryLabel: CATEGORY_LABELS[category] ?? category,
    fileName,
    originalName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    filePath,
    uploadedBy: session.name,
    uploadedAt: new Date().toISOString(),
    reviewStatus: "pending",
  };

  portalStore.addTaxFile(record);
  return NextResponse.json({ file: record }, { status: 201 });
}
