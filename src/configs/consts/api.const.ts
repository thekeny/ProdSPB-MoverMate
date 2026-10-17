export const API = {
  PREFIX: "/api/v1",
  REFRESH_PATH: "/auth/refresh",
  TIMEOUT: 30_000,
  LIMIT: 2,
  METHODS: ["get", "head", "options"],
  STATUS_CODES: [408, 429, 500, 502, 503, 504],
  PUSH_WORKER: "/push-sw.js",
  TOKEN_STORAGE_KEY: "movermate-session-v1",
  REFRESH_LOCK: "movermate-refresh",
  REFRESH_LEEWAY_MS: 30_000,
};

export const QUERY_KEYS = {
  ME: ["me"],
  TASK_TEMPLATES: ["task-templates"],
  PROJECTS: ["projects"],
  PROJECT_DATA: (projectId: string) => ["projects", projectId, "data"],
  PROJECT_SUMMARY: (projectId: string) => ["projects", projectId, "summary"],
  LOADING_CHECKLIST: (projectId: string) => [
    "projects",
    projectId,
    "loading-checklist",
  ],
  UNPACKING_PROGRESS: (projectId: string) => [
    "projects",
    projectId,
    "unpacking-progress",
  ],
  BOX_LABELS: (projectId: string, boxIds?: string[]) => [
    "projects",
    projectId,
    "labels",
    ...(boxIds ?? []),
  ],
  BOX_BY_QR: (token: string) => ["boxes", "qr", token],
  BOX_BY_QR_PREFIX: ["boxes", "qr"] as const,
  ITEM_SUGGESTIONS: (projectId: string, itemId?: string) => [
    "projects",
    projectId,
    "item-suggestions",
    ...(itemId ? [itemId] : []),
  ],
  ITEM_SEARCHES: (projectId: string) => [
    "projects",
    projectId,
    "items",
    "search",
  ],
  ITEM_SEARCH: (projectId: string, query: string) => [
    "projects",
    projectId,
    "items",
    "search",
    query,
    "pages",
  ],
  COLLABORATORS: (projectId: string) => [
    "projects",
    projectId,
    "collaborators",
  ],
} as const;
