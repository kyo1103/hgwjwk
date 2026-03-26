import { NextResponse } from "next/server";
import { clearWorkspaceSession } from "@/lib/workspace-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  return clearWorkspaceSession(response);
}
