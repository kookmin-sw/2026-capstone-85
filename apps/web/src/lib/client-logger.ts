import { getApiBaseUrl } from "./runtime-config";

type ClientLogValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClientLogValue[]
  | { [key: string]: ClientLogValue };

export type ClientLogContext = Record<string, ClientLogValue>;

type ClientLogLevel = "debug" | "info" | "warn" | "error";

const INCOGNITO_USER_ID_KEY = "accountit:incognito-user-id";
const API_BASE_URL = getApiBaseUrl();

export function logClientEvent(event: string, context?: ClientLogContext) {
  void sendLog("info", event, context);
}

export function logClientWarn(
  event: string,
  error?: unknown,
  context?: ClientLogContext,
) {
  void sendLog("warn", event, {
    ...context,
    error: error === undefined ? undefined : serializeError(error),
  });
}

export function logClientError(
  event: string,
  error: unknown,
  context?: ClientLogContext,
) {
  void sendLog("error", event, {
    ...context,
    error: serializeError(error),
  });
}

async function sendLog(
  level: ClientLogLevel,
  event: string,
  properties?: ClientLogContext,
) {
  if (typeof window === "undefined") return;

  try {
    await fetch(`${API_BASE_URL}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      keepalive: true,
      body: JSON.stringify({
        key: event,
        level,
        source: "FE",
        incognitoUserId: getIncognitoUserId(),
        path: getCurrentPath(),
        properties: sanitizeProperties(compactContext(properties)),
      }),
    });
  } catch {
    // Logging failures should never affect the user's flow.
  }
}

function compactContext(context?: ClientLogContext) {
  if (!context) return undefined;
  const entries = Object.entries(context).filter(
    ([, value]) => value !== undefined,
  );
  return entries.length ? Object.fromEntries(entries) : undefined;
}

function serializeError(error: unknown): ClientLogValue {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    name: typeof error,
    message: String(error),
  };
}

function getCurrentPath() {
  return `${window.location.pathname}${window.location.search}`;
}

export function getIncognitoUserId() {
  if (typeof window === "undefined") return undefined;

  try {
    const existing = window.localStorage.getItem(INCOGNITO_USER_ID_KEY);
    if (existing) return existing;

    const next =
      typeof window.crypto?.randomUUID === "function"
        ? window.crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(INCOGNITO_USER_ID_KEY, next);
    return next;
  } catch {
    return undefined;
  }
}

function sanitizeProperties(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeProperties);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      isSensitiveKey(key) ? "[REDACTED]" : sanitizeProperties(entry),
    ]),
  );
}

function isSensitiveKey(key: string) {
  return [
    "authorization",
    "cookie",
    "jwt",
    "password",
    "passwordHash",
    "secret",
    "token",
    "access_token",
    "refresh_token",
  ].includes(key);
}
