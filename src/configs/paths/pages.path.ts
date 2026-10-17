export const pages = {
  ROOT: "/",
  LOGIN: "/login",
  PROJECTS: "/projects",
  PROJECTS_NEW: "/projects/new",
  DASHBOARD: "/dashboard",
  BOXES: "/boxes",
  BOX: "/box",
  PLAN: "/plan",
  LABELS: "/labels",
  PROGRESS: "/progress",
} as const;

export type PagePath = (typeof pages)[keyof typeof pages];
