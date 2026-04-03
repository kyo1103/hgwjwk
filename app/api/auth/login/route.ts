import { NextResponse } from "next/server";
import { authenticateWorkspaceUser, getRequestIp, setWorkspaceSession } from "@/lib/workspace-auth";
import { canStartSessionForIp, registerActiveSession } from "@/lib/workspace-session-store";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const allowAdmin = body?.allowAdmin === true;

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, message: "이메일과 비밀번호를 입력해 주세요." },
      { status: 400 },
    );
  }

  const session = authenticateWorkspaceUser(email, password);
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "로그인 정보가 맞지 않습니다." },
      { status: 401 },
    );
  }

  if (session.scope !== "client" && !allowAdmin) {
    return NextResponse.json(
      { ok: false, message: "고객사 계정만 로그인할 수 있습니다." },
      { status: 403 },
    );
  }

  const ip = getRequestIp(req.headers);
  const previewResponse = NextResponse.json({ ok: true, session });
  const { response, sessionId } = setWorkspaceSession(previewResponse, session);

  if (!canStartSessionForIp(ip, sessionId)) {
    return NextResponse.json(
      { ok: false, message: "같은 IP에서는 한 계정만 로그인할 수 있습니다." },
      { status: 409 },
    );
  }

  registerActiveSession(ip, sessionId, session.userId);
  return response;
}
