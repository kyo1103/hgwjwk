import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { findWorkspaceUserByEmail, toWorkspaceSession, type WorkspaceSession } from "@/lib/workspace-users";

const SESSION_COOKIE_NAME = "nomo_workspace_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function getSessionSecret() {
  return process.env.SESSION_SECRET || "nomo-workspace-local-secret";
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function sealSession(session: WorkspaceSession) {
  const payload = encode(
    JSON.stringify({
      ...session,
      issuedAt: new Date().toISOString(),
    }),
  );

  return `${payload}.${sign(payload)}`;
}

function openSession(token: string): WorkspaceSession | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  if (signature.length !== expected.length) return null;

  const signatureBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(decode(payload)) as WorkspaceSession & { issuedAt?: string };
    const { issuedAt: _issuedAt, ...session } = parsed;
    return session;
  } catch {
    return null;
  }
}

export function authenticateWorkspaceUser(email: string, password: string) {
  const user = findWorkspaceUserByEmail(email);
  if (!user || user.password !== password) {
    return null;
  }

  return toWorkspaceSession(user);
}

export function getWorkspaceSession() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return openSession(token);
}

export function setWorkspaceSession(response: NextResponse, session: WorkspaceSession) {
  response.cookies.set(SESSION_COOKIE_NAME, sealSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return response;
}

export function clearWorkspaceSession(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
