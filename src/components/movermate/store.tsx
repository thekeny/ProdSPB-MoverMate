"use client";

import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  type Account,
  createDemoProject,
  createEmptyProject,
  type Project,
  type Room,
  STORAGE_KEY,
  type TaskStage,
  uid,
} from "@/configs/consts/movermate.const";
import { pages } from "@/configs/paths/pages.path";
import { normalizeAccount, normalizeProject } from "@/lib/movermate-storage";

type Store = {
  ready: boolean;
  account: Account | null;
  projects: Project[];
  project: Project | null;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  authenticate: (
    event: FormEvent<HTMLFormElement>,
    mode: "login" | "register",
  ) => void;
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
  logout: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function MoverMateProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved) as {
          account?: unknown;
          projects?: unknown;
          activeId?: unknown;
        };
        const loadedProjects = Array.isArray(data.projects)
          ? data.projects
              .map(normalizeProject)
              .filter((item): item is Project => item !== null)
          : [];
        const loadedActiveId =
          typeof data.activeId === "string" &&
          loadedProjects.some((item) => item.id === data.activeId)
            ? data.activeId
            : null;
        setAccount(normalizeAccount(data.account));
        setProjects(loadedProjects);
        setActiveId(loadedActiveId);
      }
    } catch {
      setAccount(null);
      setProjects([]);
      setActiveId(null);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ account, projects, activeId }),
      );
    } catch {
      // Storage can be unavailable or full; the in-memory state remains usable.
    }
  }, [account, projects, activeId, ready]);

  const project = projects.find((item) => item.id === activeId) ?? null;
  const updateProject = (apply: (current: Project) => Project) =>
    setProjects((current) =>
      current.map((item) => (item.id === activeId ? apply(item) : item)),
    );

  const authenticate = (
    event: FormEvent<HTMLFormElement>,
    _mode: "login" | "register",
  ) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = String(data.get("username") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (username.length < 3 || password.length < 4) return;
    const form = event.currentTarget;
    const confirmation = form.elements.namedItem(
      "confirmPassword",
    ) as HTMLInputElement | null;
    if (confirmation) {
      const matches = password === confirmation.value;
      confirmation.setCustomValidity(matches ? "" : "Пароли должны совпадать.");
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
    }
    setAccount({ username, token: `demo_${uid("token")}` });
    const demo = projects.length ? null : createDemoProject();
    if (demo) {
      setProjects([demo]);
      setActiveId(demo.id);
    } else if (!activeId) {
      setActiveId(projects[0].id);
    }
    router.replace(pages.DASHBOARD);
  };

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
    setProjects((current) => [...current, next]);
    setActiveId(next.id);
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
          deferred: items.length === 0,
          status: items.length ? "packed" : "packing",
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
          title: String(data.get("title")),
          stage: data.get("stage") as TaskStage,
          assignee: String(data.get("assignee") ?? ""),
          due: String(data.get("due") ?? "По плану"),
          done: false,
        },
      ],
    }));
  };

  const value = {
    ready,
    account,
    projects,
    project,
    activeId,
    setActiveId: (id: string | null) => {
      setActiveId(
        id !== null && projects.some((item) => item.id === id) ? id : null,
      );
    },
    authenticate,
    createProject,
    updateProject,
    updateProjectMeta: (
      values: Partial<
        Pick<Project, "name" | "date" | "from" | "to" | "qrCodeStrategy">
      >,
    ) => {
      updateProject((current) => ({ ...current, ...values }));
    },
    deleteProject: () => {
      if (!activeId) return;
      const remaining = projects.filter((item) => item.id !== activeId);
      setProjects(remaining);
      const fallback = remaining[0];
      if (fallback) {
        setActiveId(fallback.id);
        router.replace(pages.DASHBOARD);
      } else {
        setActiveId(null);
        router.replace(pages.PROJECTS);
      }
    },
    addBox,
    addTask,
    logout: () => {
      setAccount(null);
      setProjects([]);
      setActiveId(null);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore unavailable storage during logout.
      }
      router.replace(pages.LOGIN);
    },
  };
  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useMoverMate() {
  const store = useContext(StoreContext);
  if (!store)
    throw new Error("useMoverMate must be used within MoverMateProvider");
  return store;
}
