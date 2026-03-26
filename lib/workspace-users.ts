export type WorkspaceScope = "admin" | "client";

export interface WorkspaceSession {
  userId: string;
  email: string;
  name: string;
  phone: string;
  scope: WorkspaceScope;
  roleKey: "tax_manager" | "labor_manager" | "client_owner" | "client_hr";
  roleLabel: string;
  companyName: string;
  tenantSlug?: string;
  clientId?: string;
}

interface WorkspaceSeedUser extends WorkspaceSession {
  password: string;
}

const WORKSPACE_USERS: WorkspaceSeedUser[] = [
  {
    userId: "u1",
    email: "tax@firm.com",
    password: "tax1234",
    name: "허건우 세무사",
    phone: "010-1111-1111",
    scope: "admin",
    roleKey: "tax_manager",
    roleLabel: "세무사 관리자",
    companyName: "세무법인 가온텍스",
  },
  {
    userId: "u2",
    email: "labor@firm.com",
    password: "labor1234",
    name: "장원교 노무사",
    phone: "010-2222-2222",
    scope: "admin",
    roleKey: "labor_manager",
    roleLabel: "노무사 관리자",
    companyName: "신정 노동법률사무소",
  },
  {
    userId: "u3",
    email: "owner@clinic.com",
    password: "owner1234",
    name: "박원장",
    phone: "010-3333-3333",
    scope: "client",
    roleKey: "client_owner",
    roleLabel: "고객사 대표",
    companyName: "OOO의원",
    tenantSlug: "ooo-clinic",
    clientId: "c2",
  },
  {
    userId: "u4",
    email: "hr@clinic.com",
    password: "hr1234",
    name: "정인사",
    phone: "010-4444-4444",
    scope: "client",
    roleKey: "client_hr",
    roleLabel: "고객사 인사담당",
    companyName: "OOO의원",
    tenantSlug: "ooo-clinic",
    clientId: "c2",
  },
];

export const workspaceDemoAccounts = WORKSPACE_USERS.map((user) => ({
  email: user.email,
  password: user.password,
  name: user.name,
  scope: user.scope,
  roleLabel: user.roleLabel,
  companyName: user.companyName,
}));

export function findWorkspaceUserByEmail(email: string) {
  return WORKSPACE_USERS.find((user) => user.email.toLowerCase() === email.trim().toLowerCase());
}

export function toWorkspaceSession(user: WorkspaceSeedUser): WorkspaceSession {
  const { password: _password, ...session } = user;
  return session;
}
