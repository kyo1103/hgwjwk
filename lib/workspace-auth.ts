import crypto from "node:crypto";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import type { NextResponse } from "next/server";
import { findWorkspaceUserByEmail, toWorkspaceSession, type WorkspaceSession } from "@/lib/workspace-users";
import { clearActiveSession, validateActiveSession } from "@/lib/workspace-session-store";

const SESSION_COOKIE_NAME = "nomo_workspace_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

type SealedWorkspaceSession = WorkspaceSession & {
  issuedAt?: string;
  sessionId?: string;
};

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

function sealSession(session: WorkspaceSession, sessionId: string) {
  const payload = encode(
    JSON.stringify({
      ...session,
      sessionId,
      issuedAt: new Date().toISOString(),
    }),
  );

  return `${payload}.${sign(payload)}`;
}

function openSession(token: string): SealedWorkspaceSession | null {
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
    return JSON.parse(decode(payload)) as SealedWorkspaceSession;
  } catch {
    return null;
  }
}

export function getRequestIp(headersList: Headers) {
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = headersList.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "local";
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
  const sealed = openSession(token);
  if (!sealed?.sessionId) return null;

  const requestIp = getRequestIp(headers());
  const isValid = validateActiveSession(requestIp, sealed.sessionId);
  if (!isValid) {
    return null;
  }

  const { issuedAt: _issuedAt, sessionId: _sessionId, ...session } = sealed;
  return session;
}

export function setWorkspaceSession(response: NextResponse, session: WorkspaceSession) {
  const sessionId = crypto.randomUUID();

  response.cookies.set(SESSION_COOKIE_NAME, sealSession(session, sessionId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return { response, sessionId };
}

export function clearWorkspaceSession(response: NextResponse) {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const sealed = token ? openSession(token) : null;
  if (sealed?.sessionId) {
    clearActiveSession(getRequestIp(headers()), sealed.sessionId);
  }

  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
