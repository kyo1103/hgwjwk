import { NextResponse } from "next/server";
import { authenticateWorkspaceUser, setWorkspaceSession } from "@/lib/workspace-auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

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

  const response = NextResponse.json({ ok: true, session });
  return setWorkspaceSession(response, session);
}
