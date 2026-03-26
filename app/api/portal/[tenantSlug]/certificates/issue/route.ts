import { NextRequest, NextResponse } from "next/server";
import { portalStore, type CertIssueRecord } from "@/lib/server/portal-store";
import { getWorkspaceSession } from "@/lib/workspace-auth";

// 민원증명 발급 요청 → Bridge Agent로 전달 또는 직접 샘플 생성
export async function POST(req: NextRequest, { params }: { params: { tenantSlug: string } }) {
  const session = getWorkspaceSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { certType, certTitle, source } = body as {
    certType: string;
    certTitle: string;
    source: string;
  };

  const id = `ci_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const record: CertIssueRecord = {
    id,
    tenantSlug: params.tenantSlug,
    certType,
    certTitle,
    source,
    requestedBy: session.name,
    status: "processing",
    requestedAt: new Date().toISOString(),
  };

  portalStore.addCertRecord(record);

  // Bridge Agent 연동 시도
  const BRIDGE_URL = process.env.BRIDGE_URL ?? "http://127.0.0.1:43115";
  try {
    const resp = await fetch(`${BRIDGE_URL}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: params.tenantSlug,
        channels: [certType],
        requestedBy: session.name,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (resp.ok) {
      const data = await resp.json() as { jobId?: string };
      portalStore.updateCertRecord(id, { status: "processing" });
      // 비동기 폴링으로 완료 감지 (별도 처리)
      return NextResponse.json({ record, bridgeJobId: data.jobId }, { status: 202 });
    }
  } catch {
    // Bridge 없으면 10초 후 완료 시뮬레이션
  }

  // Bridge 없을 때: 바로 완료 처리 (샘플 모드)
  setTimeout(() => {
    portalStore.updateCertRecord(id, {
      status: "done",
      completedAt: new Date().toISOString(),
      filePath: `/api/portal/${params.tenantSlug}/certificates/download/${id}`,
    });
  }, 3000);

  return NextResponse.json({ record }, { status: 202 });
}
