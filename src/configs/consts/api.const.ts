export const API = {
  PREFIX: "/api/v1",
  REFRESH_PATH: "/auth/refresh",
  TIMEOUT: 30_000,
  LIMIT: 2,
  METHODS: ["get", "head", "options"],
  STATUS_CODES: [408, 429, 500, 502, 503, 504],
  TOKEN_STORAGE_KEY: "movermate-session-v1",
  REFRESH_LOCK: "movermate-refresh",
  REFRESH_LEEWAY_MS: 30_000,
};

export const QUERY_KEYS = {
  ME: ["me"],
} as const;
