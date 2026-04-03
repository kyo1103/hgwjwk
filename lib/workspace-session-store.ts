type ActiveSessionEntry = {
  ip: string;
  sessionId: string;
  userId: string;
  updatedAt: number;
};

const SESSION_STORE_KEY = "__hgwjwk_active_sessions__";
const SESSION_IDLE_TTL_MS = 1000 * 60 * 60 * 12;

function getStore() {
  const globalScope = globalThis as typeof globalThis & {
    [SESSION_STORE_KEY]?: Map<string, ActiveSessionEntry>;
  };

  if (!globalScope[SESSION_STORE_KEY]) {
    globalScope[SESSION_STORE_KEY] = new Map<string, ActiveSessionEntry>();
  }

  return globalScope[SESSION_STORE_KEY]!;
}

function isExpired(entry: ActiveSessionEntry) {
  return Date.now() - entry.updatedAt > SESSION_IDLE_TTL_MS;
}

function cleanupExpiredEntries(store: Map<string, ActiveSessionEntry>) {
  for (const [ip, entry] of store.entries()) {
    if (isExpired(entry)) {
      store.delete(ip);
    }
  }
}

export function canStartSessionForIp(ip: string, sessionId: string) {
  const store = getStore();
  cleanupExpiredEntries(store);
  const current = store.get(ip);
  return !current || current.sessionId === sessionId;
}

export function registerActiveSession(ip: string, sessionId: string, userId: string) {
  const store = getStore();
  cleanupExpiredEntries(store);
  store.set(ip, {
    ip,
    sessionId,
    userId,
    updatedAt: Date.now(),
  });
}

export function validateActiveSession(ip: string, sessionId: string) {
  const store = getStore();
  cleanupExpiredEntries(store);
  const current = store.get(ip);
  if (!current) return false;
  if (current.sessionId !== sessionId) return false;
  current.updatedAt = Date.now();
  return true;
}

export function clearActiveSession(ip: string, sessionId?: string) {
  const store = getStore();
  const current = store.get(ip);
  if (!current) return;
  if (sessionId && current.sessionId !== sessionId) return;
  store.delete(ip);
}
