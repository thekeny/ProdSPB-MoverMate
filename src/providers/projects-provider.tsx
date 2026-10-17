"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  addCollaborator as addCollaboratorApi,
  createProject as createProjectApi,
  deleteProject as deleteProjectApi,
  listCollaborators,
  listProjects,
  removeCollaborator as removeCollaboratorApi,
  setProjectReminders,
  updateProject as updateProjectApi,
} from "@/api/generated";
import type {
  CollaboratorResponse,
  ProjectResponse,
} from "@/api/generated/types.gen";
import { unwrap } from "@/api/request";
import { QUERY_KEYS } from "@/configs/consts/api.const";
import {
  LEGACY_PROJECTS_STORAGE_PREFIX,
  PROJECTS_STORAGE_PREFIX,
} from "@/configs/consts/storage.const";
import { pages } from "@/configs/paths/pages.path";
import type { Project, ProjectLocalData } from "@/configs/types/project.type";
import type { TaskStage } from "@/configs/types/task.type";
import type {
  BoxFormValues,
  ProjectFormValues,
  TaskFormValues,
} from "@/lib/forms/project.schema";
import { uid } from "@/lib/id";
import {
  createProjectLocalData,
  getBrowserTimeZone,
  parseRoomList,
} from "@/lib/project";
import { parseStoredProjects } from "@/lib/project-storage";
import { useAuth } from "@/providers/auth-provider";

type StoredState = {
  userId: string;
  activeId: string | null;
  data: Record<string, ProjectLocalData>;
};

type ProjectMeta = Pick<
  Project,
  "name" | "date" | "from" | "to" | "qrCodeStrategy"
> & { reminderOffsetsDays: number[] };

type ProjectsContextValue = {
  ready: boolean;
  projects: Project[];
  project: Project | null;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  createProject: (values: ProjectFormValues) => Promise<void>;
  updateProject: (apply: (project: Project) => Project) => void;
  updateProjectMeta: (values: Partial<ProjectMeta>) => Promise<void>;
  addCollaborator: (username: string) => Promise<void>;
  removeCollaborator: (userId: string, username: string) => Promise<void>;
  deleteProject: () => Promise<void>;
  addBox: (values: BoxFormValues) => void;
  addTask: (values: TaskFormValues) => void;
};

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

function loadStoredState(userId: string): StoredState {
  const empty = { userId, activeId: null, data: {} };
  try {
    const raw =
      localStorage.getItem(`${PROJECTS_STORAGE_PREFIX}:${userId}`) ??
      localStorage.getItem(`${LEGACY_PROJECTS_STORAGE_PREFIX}:${userId}`);
    const parsed = parseStoredProjects(raw);
    return {
      userId,
      activeId: parsed.activeId,
      data: parsed.data,
    };
  } catch {
    return empty;
  }
}

function toProject(
  response: ProjectResponse,
  collaborators: Awaited<ReturnType<typeof listCollaborators>>["data"],
  localData: ProjectLocalData,
): Project {
  const members = (collaborators ?? []).map((entry) => ({
    userId: entry.user.id,
    username: entry.user.username,
    isOwner: entry.is_owner,
  }));
  return {
    ...localData,
    id: response.id,
    ownerId: response.owner.id,
    isOwner: response.is_owner,
    name: response.name,
    date: response.moving_date,
    from: response.origin_address ?? "",
    to: response.destination_address ?? "",
    qrCodeStrategy: response.qr_code_strategy === "OPEN" ? "open" : "protected",
    timeZone: response.time_zone,
    reminderOffsetsDays: response.reminder_offsets_days,
    collaborators: members,
    members: members.map((entry) => entry.username),
  };
}

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { account, ready: authReady } = useAuth();
  const accountId = account?.id ?? null;
  const [stored, setStored] = useState<StoredState | null>(null);

  useEffect(() => {
    setStored(accountId ? loadStoredState(accountId) : null);
  }, [accountId]);

  useEffect(() => {
    if (!stored) return;
    try {
      localStorage.setItem(
        `${PROJECTS_STORAGE_PREFIX}:${stored.userId}`,
        JSON.stringify({ activeId: stored.activeId, data: stored.data }),
      );
    } catch {
      // In-memory project data remains usable when browser storage is unavailable.
    }
  }, [stored]);

  const projectsQuery = useQuery({
    queryKey: QUERY_KEYS.PROJECTS,
    enabled: authReady && Boolean(accountId),
    queryFn: async () => {
      const responses = await unwrap(listProjects());
      return Promise.all(
        responses.map(async (response) => {
          const collaborators = await unwrap(
            listCollaborators({ path: { project_id: response.id } }),
          );
          return { response, collaborators };
        }),
      );
    },
  });

  const serverProjects = projectsQuery.data ?? [];
  const projects = useMemo(
    () =>
      serverProjects.map(({ response, collaborators }) =>
        toProject(
          response,
          collaborators,
          stored?.data[response.id] ?? createProjectLocalData(),
        ),
      ),
    [serverProjects, stored],
  );
  const activeId = stored?.activeId ?? null;
  const project = projects.find((item) => item.id === activeId) ?? null;
  const ready =
    authReady &&
    (!accountId || stored?.userId === accountId) &&
    (!accountId || !projectsQuery.isPending);

  const patchStored = useCallback(
    (apply: (current: StoredState) => StoredState) =>
      setStored((current) => (current ? apply(current) : current)),
    [],
  );

  const setActiveId = (id: string | null) =>
    patchStored((current) => ({
      ...current,
      activeId:
        id !== null && projects.some((item) => item.id === id) ? id : null,
    }));

  const updateProject = (apply: (current: Project) => Project) => {
    if (!project) return;
    const updated = apply(project);
    const data: ProjectLocalData = {
      sourceRooms: updated.sourceRooms,
      lastSourceRoom: updated.lastSourceRoom,
      destinationRooms: updated.destinationRooms,
      boxes: updated.boxes,
      nextBoxNumber: updated.nextBoxNumber,
      items: updated.items,
      tasks: updated.tasks,
    };
    patchStored((current) => ({
      ...current,
      data: { ...current.data, [project.id]: data },
    }));
  };

  const createProject = async (values: ProjectFormValues) => {
    const sourceRooms = parseRoomList(values.sourceRooms);
    const destinationRooms = parseRoomList(values.destinationRooms);
    const response = await unwrap(
      createProjectApi({
        body: {
          name: values.name.trim(),
          moving_date: values.date,
          time_zone: getBrowserTimeZone(),
          origin_address: values.from.trim() || null,
          destination_address: values.to.trim() || null,
          qr_code_strategy: "PROTECTED",
          reminder_offsets_days: [14, 7, 1],
          rooms: { source: sourceRooms, destination: destinationRooms },
        },
        headers: { "idempotency-key": uid("create") },
      }),
    );
    patchStored((current) => ({
      ...current,
      activeId: response.id,
      data: {
        ...current.data,
        [response.id]: createProjectLocalData({
          source: sourceRooms,
          destination: destinationRooms,
        }),
      },
    }));
    queryClient.setQueryData(
      QUERY_KEYS.PROJECTS,
      (
        current:
          | {
              response: ProjectResponse;
              collaborators: CollaboratorResponse[];
            }[]
          | undefined,
      ) => [
        ...(current ?? []),
        {
          response,
          collaborators: [
            {
              user: response.owner,
              is_owner: true,
              created_at: response.created_at,
            },
          ],
        },
      ],
    );
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
    router.replace(pages.DASHBOARD);
  };

  const updateProjectMeta: ProjectsContextValue["updateProjectMeta"] = async (
    values,
  ) => {
    if (!project) return;
    const body = {
      ...(values.name !== undefined ? { name: values.name.trim() } : {}),
      ...(values.date !== undefined ? { moving_date: values.date } : {}),
      ...(values.from !== undefined
        ? { origin_address: values.from.trim() || null }
        : {}),
      ...(values.to !== undefined
        ? { destination_address: values.to.trim() || null }
        : {}),
      ...(values.qrCodeStrategy !== undefined
        ? {
            qr_code_strategy:
              values.qrCodeStrategy === "open"
                ? ("OPEN" as const)
                : ("PROTECTED" as const),
          }
        : {}),
    };
    if (Object.keys(body).length)
      await unwrap(
        updateProjectApi({ path: { project_id: project.id }, body }),
      );
    if (
      values.reminderOffsetsDays &&
      JSON.stringify(values.reminderOffsetsDays) !==
        JSON.stringify(project.reminderOffsetsDays)
    )
      await unwrap(
        setProjectReminders({
          path: { project_id: project.id },
          body: { offsets_days: values.reminderOffsetsDays },
        }),
      );
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
  };

  const addCollaborator = async (username: string) => {
    if (!project) return;
    await unwrap(
      addCollaboratorApi({
        path: { project_id: project.id },
        body: { username: username.trim().toLowerCase() },
      }),
    );
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
  };

  const removeCollaborator = async (userId: string, username: string) => {
    if (!project) return;
    await unwrap(
      removeCollaboratorApi({
        path: { project_id: project.id, user_id: userId },
      }),
    );
    patchStored((current) => ({
      ...current,
      data: {
        ...current.data,
        [project.id]: {
          ...current.data[project.id],
          tasks:
            current.data[project.id]?.tasks.map((task) => ({
              ...task,
              assignees: task.assignees.filter((name) => name !== username),
            })) ?? [],
        },
      },
    }));
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
  };

  const deleteProject = async () => {
    if (!project) return;
    await unwrap(deleteProjectApi({ path: { project_id: project.id } }));
    const fallback = projects.find((item) => item.id !== project.id) ?? null;
    patchStored((current) => {
      const data = { ...current.data };
      delete data[project.id];
      return { ...current, data, activeId: fallback?.id ?? null };
    });
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
    router.replace(fallback ? pages.DASHBOARD : pages.PROJECTS);
  };

  const addBox = (values: BoxFormValues) => {
    const items = values.items
      .map((item) => ({ ...item, name: item.name.trim() }))
      .filter((item) => item.name);
    const title = values.title.trim();
    updateProject((current) => {
      const id = uid("box");
      const sourceRoom = values.sourceRoom || current.sourceRooms[0];
      return {
        ...current,
        lastSourceRoom: sourceRoom,
        nextBoxNumber: current.nextBoxNumber + 1,
        boxes: [
          {
            id,
            number: current.nextBoxNumber,
            qrToken: uid("qr"),
            title,
            room: values.room || current.destinationRooms[0],
            sourceRooms: [sourceRoom],
            fragile: values.fragile,
            status: "packing",
          },
          ...current.boxes,
        ],
        items: [
          ...current.items,
          ...items.map(({ name, quantity }) => ({
            id: uid("item"),
            name,
            state: "IN_BOX" as const,
            sourceRoom,
            boxId: id,
            quantity,
            priority: "NORMAL" as const,
          })),
        ],
      };
    });
  };

  const addTask = (values: TaskFormValues) => {
    updateProject((current) => ({
      ...current,
      tasks: [
        ...current.tasks,
        {
          id: uid("task"),
          title: values.title.trim(),
          description: values.description.trim(),
          stage: values.stage as TaskStage,
          assignees: values.assignees,
          dueAt: values.dueDate
            ? `${values.dueDate}${values.dueTime ? `T${values.dueTime}` : ""}`
            : null,
          done: false,
        },
      ],
    }));
  };

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
        addCollaborator,
        removeCollaborator,
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
