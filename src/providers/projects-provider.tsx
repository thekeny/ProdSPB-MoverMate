"use client";

import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { PROJECTS_STORAGE_PREFIX } from "@/configs/consts/storage.const";
import { DEFAULT_TASK_DUE } from "@/configs/consts/tasks.const";
import { pages } from "@/configs/paths/pages.path";
import type { Project } from "@/configs/types/project.type";
import type { Room } from "@/configs/types/room.type";
import type { TaskStage } from "@/configs/types/task.type";
import { uid } from "@/lib/id";
import { createEmptyProject } from "@/lib/project";
import { normalizeProject } from "@/lib/project-storage";
import { useAuth } from "@/providers/auth-provider";

type ProjectsContextValue = {
  ready: boolean;
  projects: Project[];
  project: Project | null;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  createProject: (event: FormEvent<HTMLFormElement>) => void;
  updateProject: (apply: (project: Project) => Project) => void;
  updateProjectMeta: (
    values: Partial<
      Pick<Project, "name" | "date" | "from" | "to" | "qrCodeStrategy">
    >,
  ) => void;
  deleteProject: () => void;
  addBox: (event: FormEvent<HTMLFormElement>) => void;
  addTask: (event: FormEvent<HTMLFormElement>) => void;
};

type LocalState = {
  userId: string;
  projects: Project[];
  activeId: string | null;
};

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

function loadLocal(userId: string): LocalState {
  try {
    const saved = localStorage.getItem(`${PROJECTS_STORAGE_PREFIX}:${userId}`);
    if (saved) {
      const data = JSON.parse(saved) as {
        projects?: unknown;
        activeId?: unknown;
      };
      const projects = Array.isArray(data.projects)
        ? data.projects
            .map(normalizeProject)
            .filter((item): item is Project => item !== null)
        : [];
      const activeId =
        typeof data.activeId === "string" &&
        projects.some((item) => item.id === data.activeId)
          ? data.activeId
          : null;
      return { userId, projects, activeId };
    }
  } catch {
    // Corrupted local data is dropped; the account itself lives on the server.
  }
  return { userId, projects: [], activeId: null };
}

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { account, ready: authReady } = useAuth();
  const accountId = account?.id ?? null;
  const [local, setLocal] = useState<LocalState | null>(null);

  useEffect(() => {
    setLocal(accountId ? loadLocal(accountId) : null);
  }, [accountId]);

  useEffect(() => {
    if (!local) return;
    try {
      localStorage.setItem(
        `${PROJECTS_STORAGE_PREFIX}:${local.userId}`,
        JSON.stringify({ projects: local.projects, activeId: local.activeId }),
      );
    } catch {
      // Storage can be unavailable or full; the in-memory state remains usable.
    }
  }, [local]);

  const ready = authReady && (!accountId || local?.userId === accountId);
  const projects = local?.projects ?? [];
  const activeId = local?.activeId ?? null;
  const project = projects.find((item) => item.id === activeId) ?? null;

  const patchLocal = useCallback(
    (apply: (state: LocalState) => LocalState) =>
      setLocal((current) => (current ? apply(current) : current)),
    [],
  );

  const setActiveId = (id: string | null) =>
    patchLocal((state) => ({
      ...state,
      activeId:
        id !== null && state.projects.some((item) => item.id === id)
          ? id
          : null,
    }));

  const updateProject = (apply: (current: Project) => Project) =>
    patchLocal((state) => ({
      ...state,
      projects: state.projects.map((item) =>
        item.id === state.activeId ? apply(item) : item,
      ),
    }));

  const createProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = createEmptyProject({
      name: String(data.get("name") ?? "").trim(),
      date: String(data.get("date") ?? ""),
      from: String(data.get("from") ?? "").trim(),
      to: String(data.get("to") ?? "").trim(),
    });
    if (!next.name || !next.date) return;
    patchLocal((state) => ({
      ...state,
      projects: [...state.projects, next],
      activeId: next.id,
    }));
    router.replace(pages.DASHBOARD);
  };

  const addBox = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const items = String(data.get("items") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const title = String(data.get("title") ?? "").trim();
    if (!title) return;
    updateProject((current) => ({
      ...current,
      boxes: [
        {
          id: uid("box").toUpperCase(),
          title,
          room: data.get("room") as Room,
          fragile: data.get("fragile") === "on",
          deferred: false,
          status: "packing",
          salt: uid("salt"),
          items: items.map((name) => ({
            id: uid("item"),
            name,
            unpacked: false,
            lost: false,
          })),
        },
        ...current.boxes,
      ],
    }));
  };

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    if (!title) return;
    updateProject((current) => ({
      ...current,
      tasks: [
        ...current.tasks,
        {
          id: uid("task"),
          title,
          stage: data.get("stage") as TaskStage,
          assignee: String(data.get("assignee") ?? ""),
          due: String(data.get("due") ?? DEFAULT_TASK_DUE),
          done: false,
        },
      ],
    }));
  };

  const deleteProject = () => {
    if (!activeId) return;
    const remaining = projects.filter((item) => item.id !== activeId);
    const fallback = remaining[0] ?? null;
    patchLocal((state) => ({
      ...state,
      projects: remaining,
      activeId: fallback?.id ?? null,
    }));
    router.replace(fallback ? pages.DASHBOARD : pages.PROJECTS);
  };

  const updateProjectMeta: ProjectsContextValue["updateProjectMeta"] = (
    values,
  ) => updateProject((current) => ({ ...current, ...values }));

  return (
    <ProjectsContext.Provider
      value={{
        ready,
        projects,
        project,
        activeId,
        setActiveId,
        createProject,
        updateProject,
        updateProjectMeta,
        deleteProject,
        addBox,
        addTask,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const value = useContext(ProjectsContext);
  if (!value)
    throw new Error("useProjects must be used within ProjectsProvider");
  return value;
}
