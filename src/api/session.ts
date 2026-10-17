import type { TokenPairResponse } from "@/api/generated/types.gen";
import { API } from "@/configs/consts/api.const";
import type { Session } from "@/configs/types/auth.type";

const listeners = new Set<() => void>();
let inflight: Promise<string | undefined> | null = null;

function notify() {
  for (const listener of listeners) listener();
}

function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(API.TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<Session>;
    if (
      typeof data.accessToken === "string" &&
      typeof data.accessExpiresAt === "number" &&
      typeof data.refreshToken === "string"
    )
      return data as Session;
  } catch {
    // Corrupted storage is treated as a missing session.
  }
  return null;
}

export function hasSession() {
  return readSession() !== null;
}

export function saveSession(tokens: TokenPairResponse) {
  const session: Session = {
    accessToken: tokens.access_token,
    accessExpiresAt: Date.now() + tokens.expires_in * 1000,
    refreshToken: tokens.refresh_token,
  };
  try {
    localStorage.setItem(API.TOKEN_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage may be unavailable; the user will have to log in again later.
  }
  notify();
}

export function clearSession() {
  try {
    localStorage.removeItem(API.TOKEN_STORAGE_KEY);
  } catch {
    // Nothing to clear when storage is unavailable.
  }
  notify();
}

export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === API.TOKEN_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function isFresh(session: Session) {
  return session.accessExpiresAt - Date.now() > API.REFRESH_LEEWAY_MS;
}

async function exchange(): Promise<string | undefined> {
  const current = readSession();
  if (!current) return undefined;
  if (isFresh(current)) return current.accessToken;

  let response: Response;
  try {
    response = await fetch(`${API.PREFIX}${API.REFRESH_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: current.refreshToken }),
    });
  } catch {
    return current.accessToken;
  }
  if (response.ok) {
    const tokens = (await response.json()) as TokenPairResponse;
    saveSession(tokens);
    return tokens.access_token;
  }
  if (response.status === 401 || response.status === 422) clearSession();
  return undefined;
}

async function refreshExclusively(): Promise<string | undefined> {
  if (typeof navigator !== "undefined" && "locks" in navigator)
    return (await navigator.locks.request(API.REFRESH_LOCK, exchange)) as
      | string
      | undefined;
  return exchange();
}

export async function getAccessToken(): Promise<string | undefined> {
  const session = readSession();
  if (!session) return undefined;
  if (isFresh(session)) return session.accessToken;
  inflight ??= refreshExclusively().finally(() => {
    inflight = null;
  });
  return (await inflight) ?? undefined;
}

export function getRefreshToken() {
  return readSession()?.refreshToken ?? undefined;
}
