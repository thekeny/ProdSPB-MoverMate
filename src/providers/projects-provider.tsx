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
  useSyncExternalStore,
} from "react";
import { toast } from "react-hot-toast";
import {
  addCollaborator as addCollaboratorApi,
  completeTask,
  createBox as createBoxApi,
  createItem as createItemApi,
  createProject as createProjectApi,
  createRoom as createRoomApi,
  createTask,
  createTasksFromTemplates,
  deleteBox as deleteBoxApi,
  deleteItem as deleteItemApi,
  deleteProject as deleteProjectApi,
  deleteRoom as deleteRoomApi,
  deleteTask,
  getBoxLabels,
  getLoadingChecklist,
  getProjectSummary,
  getUnpackingProgress,
  listCollaborators,
  listProjects,
  removeCollaborator as removeCollaboratorApi,
  reopenTask,
  setBoxStatus as setBoxStatusApi,
  setItemState,
  setProjectReminders,
  setTaskAssignees,
  setTaskReminders,
  updateBox as updateBoxApi,
  updateItem as updateItemApi,
  updateProject as updateProjectApi,
  updateTask,
} from "@/api/generated";
import type {
  CollaboratorResponse,
  ProjectResponse,
  RoomKind,
} from "@/api/generated/types.gen";
import type { ProjectData } from "@/api/project-data";
import {
  findRoomId,
  getProjectData,
  toApiBoxStatus,
  toApiDueAt,
  toApiItemPriority,
  toApiItemState,
} from "@/api/project-data";
import { ApiError, unwrap } from "@/api/request";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/configs/consts/api.const";
import {
  LEGACY_PROJECTS_STORAGE_PREFIX,
  PROJECTS_STORAGE_PREFIX,
} from "@/configs/consts/storage.const";
import { pages } from "@/configs/paths/pages.path";
import type { Status } from "@/configs/types/box.type";
import type { Project, ProjectLocalData } from "@/configs/types/project.type";
import type { TaskStage } from "@/configs/types/task.type";
import {
  getConnectivitySnapshot,
  isConnected,
  subscribeConnectivity,
} from "@/lib/connectivity";
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
  canEdit: boolean;
  ready: boolean;
  projects: Project[];
  project: Project | null;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  createProject: (values: ProjectFormValues) => Promise<void>;
  updateProject: (apply: (project: Project) => Project) => Promise<boolean>;
  changeBoxStatus: (boxId: string, status: Status) => Promise<boolean>;
  updateProjectMeta: (values: Partial<ProjectMeta>) => Promise<void>;
  addCollaborator: (username: string) => Promise<void>;
  removeCollaborator: (userId: string, username: string) => Promise<void>;
  deleteProject: () => Promise<void>;
  addBox: (values: BoxFormValues) => Promise<boolean>;
  addTask: (values: TaskFormValues) => Promise<boolean>;
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
  rooms: Project["rooms"] = [],
): Project {
  const members = (collaborators ?? []).map((entry) => ({
    userId: entry.user.id,
    username: entry.user.username,
    isOwner: entry.is_owner,
  }));
  return {
    ...localData,
    rooms,
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

function same(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function isServerId(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(
    id,
  );
}

function taskAssigneeIds(project: Project, names: string[]) {
  return names.flatMap((name) => {
    const member = project.collaborators.find(
      (collaborator) => collaborator.username === name,
    );
    return member ? [member.userId] : [];
  });
}

function apiErrorMessage(error: unknown) {
  if (error instanceof ApiError || error instanceof Error) return error.message;
  return "Не удалось загрузить данные с сервера.";
}

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { account, ready: authReady } = useAuth();
  const canEdit = useSyncExternalStore(
    subscribeConnectivity,
    getConnectivitySnapshot,
    () => true,
  );
  const accountId = account?.id ?? null;
  const [stored, setStored] = useState<StoredState | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const requireOnline = () => {
    if (isConnected()) return true;
    setMutationError("Подключитесь к интернету, чтобы изменить данные.");
    return false;
  };

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

  useEffect(() => {
    if (!mutationError) return;
    const timeout = window.setTimeout(() => setMutationError(null), 7000);
    return () => window.clearTimeout(timeout);
  }, [mutationError]);

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
  const activeId = stored?.activeId ?? null;
  const activeProjectResponse = serverProjects.find(
    ({ response }) => response.id === activeId,
  );
  const projectDataQuery = useQuery({
    queryKey: activeId
      ? QUERY_KEYS.PROJECT_DATA(activeId)
      : ["projects", null, "data"],
    enabled: authReady && Boolean(activeId && activeProjectResponse),
    queryFn: () => getProjectData(activeId as string),
  });
  useEffect(() => {
    if (!authReady || !activeId || !activeProjectResponse || !isConnected())
      return;
    void Promise.all([
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.PROJECT_SUMMARY(activeId),
        queryFn: () =>
          unwrap(getProjectSummary({ path: { project_id: activeId } })),
      }),
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.LOADING_CHECKLIST(activeId),
        queryFn: () =>
          unwrap(getLoadingChecklist({ path: { project_id: activeId } })),
      }),
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.UNPACKING_PROGRESS(activeId),
        queryFn: () =>
          unwrap(getUnpackingProgress({ path: { project_id: activeId } })),
      }),
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.BOX_LABELS(activeId),
        queryFn: () => unwrap(getBoxLabels({ path: { project_id: activeId } })),
      }),
    ]).catch(() => undefined);
  }, [activeId, activeProjectResponse, authReady, queryClient]);
  useEffect(() => {
    if (projectsQuery.error && !projectsQuery.data && isConnected())
      setMutationError(apiErrorMessage(projectsQuery.error));
  }, [projectsQuery.data, projectsQuery.error]);
  useEffect(() => {
    if (projectDataQuery.error && !projectDataQuery.data && isConnected())
      setMutationError(apiErrorMessage(projectDataQuery.error));
  }, [projectDataQuery.data, projectDataQuery.error]);
  const projects = useMemo(() => {
    const availableProjects = serverProjects.map(
      ({ response, collaborators }) => {
        const projectData =
          response.id === activeId
            ? (projectDataQuery.data ??
              queryClient.getQueryData<ProjectData>(
                QUERY_KEYS.PROJECT_DATA(response.id),
              ))
            : queryClient.getQueryData<ProjectData>(
                QUERY_KEYS.PROJECT_DATA(response.id),
              );
        const data = projectData
          ? {
              ...projectData,
              lastSourceRoom:
                stored?.data[response.id]?.lastSourceRoom &&
                projectData.sourceRooms.includes(
                  stored.data[response.id].lastSourceRoom,
                )
                  ? stored.data[response.id].lastSourceRoom
                  : projectData.lastSourceRoom,
            }
          : createProjectLocalData();
        return toProject(
          response,
          collaborators,
          data,
          projectData?.rooms ?? [],
        );
      },
    );
    return canEdit
      ? availableProjects
      : availableProjects.filter((item) =>
          queryClient.getQueryData(QUERY_KEYS.PROJECT_DATA(item.id)),
        );
  }, [
    activeId,
    canEdit,
    projectDataQuery.data,
    queryClient,
    serverProjects,
    stored,
  ]);
  const project = projects.find((item) => item.id === activeId) ?? null;
  const ready =
    authReady &&
    (!accountId || stored?.userId === accountId) &&
    (!accountId || !projectsQuery.isPending) &&
    (!activeProjectResponse || !projectDataQuery.isPending);

  const patchStored = useCallback(
    (apply: (current: StoredState) => StoredState) =>
      setStored((current) => (current ? apply(current) : current)),
    [],
  );

  const setActiveId = (id: string | null) =>
    id !== null &&
    !canEdit &&
    !queryClient.getQueryData(QUERY_KEYS.PROJECT_DATA(id))
      ? undefined
      : patchStored((current) => ({
          ...current,
          activeId:
            id !== null && projects.some((item) => item.id === id) ? id : null,
        }));

  const refreshProjectData = async (projectId: string) => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PROJECT_DATA(projectId),
      }),
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PROJECT_SUMMARY(projectId),
      }),
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.LOADING_CHECKLIST(projectId),
      }),
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.UNPACKING_PROGRESS(projectId),
      }),
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOX_LABELS(projectId),
      }),
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ITEM_SEARCHES(projectId),
      }),
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOX_BY_QR_PREFIX,
      }),
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ITEM_SUGGESTIONS(projectId),
      }),
    ]);
  };

  const syncProjectChanges = async (current: Project, updated: Project) => {
    const projectId = current.id;
    const roomKind: Record<"sourceRooms" | "destinationRooms", RoomKind> = {
      sourceRooms: "SOURCE",
      destinationRooms: "DESTINATION",
    };
    const baseline = queryClient.getQueryData<ProjectData>(
      QUERY_KEYS.PROJECT_DATA(projectId),
    );
    const knownRooms = {
      sourceRooms: baseline?.sourceRooms ?? current.sourceRooms,
      destinationRooms: baseline?.destinationRooms ?? current.destinationRooms,
    };
    for (const kind of ["sourceRooms", "destinationRooms"] as const) {
      const previous = new Set(
        knownRooms[kind].map((name) => name.toLocaleLowerCase("ru")),
      );
      for (const name of updated[kind]) {
        if (previous.has(name.toLocaleLowerCase("ru"))) continue;
        const room = await unwrap(
          createRoomApi({
            path: { project_id: projectId },
            body: { kind: roomKind[kind], name },
          }),
        );
        updated.rooms = [...updated.rooms, room];
        queryClient.setQueryData<ProjectData>(
          QUERY_KEYS.PROJECT_DATA(projectId),
          (current) =>
            current
              ? {
                  ...current,
                  rooms: current.rooms.some((entry) => entry.id === room.id)
                    ? current.rooms
                    : [...current.rooms, room],
                  sourceRooms:
                    room.kind === "SOURCE" &&
                    !current.sourceRooms.some(
                      (entry) =>
                        entry.toLocaleLowerCase("ru") ===
                        room.name.toLocaleLowerCase("ru"),
                    )
                      ? [...current.sourceRooms, room.name]
                      : current.sourceRooms,
                  destinationRooms:
                    room.kind === "DESTINATION" &&
                    !current.destinationRooms.some(
                      (entry) =>
                        entry.toLocaleLowerCase("ru") ===
                        room.name.toLocaleLowerCase("ru"),
                    )
                      ? [...current.destinationRooms, room.name]
                      : current.destinationRooms,
                }
              : current,
        );
      }
      const present = new Set(
        (baseline?.[kind] ?? current[kind]).map((entry) =>
          entry.toLocaleLowerCase("ru"),
        ),
      );
      for (const name of present) {
        if (updated[kind].some((next) => next.toLocaleLowerCase("ru") === name))
          continue;
        const roomName =
          (baseline?.[kind] ?? current[kind]).find(
            (entry) => entry.toLocaleLowerCase("ru") === name,
          ) ?? name;
        const roomId = findRoomId(
          baseline?.rooms ?? current.rooms,
          roomKind[kind],
          roomName,
        );
        if (!roomId) continue;
        await unwrap(deleteRoomApi({ path: { room_id: roomId } }));
        updated.rooms = updated.rooms.filter((room) => room.id !== roomId);
        queryClient.setQueryData<ProjectData>(
          QUERY_KEYS.PROJECT_DATA(projectId),
          (cached) =>
            cached
              ? {
                  ...cached,
                  rooms: cached.rooms.filter((room) => room.id !== roomId),
                  sourceRooms:
                    kind === "sourceRooms"
                      ? cached.sourceRooms.filter(
                          (entry) =>
                            entry.toLocaleLowerCase("ru") !==
                            roomName.toLocaleLowerCase("ru"),
                        )
                      : cached.sourceRooms,
                  destinationRooms:
                    kind === "destinationRooms"
                      ? cached.destinationRooms.filter(
                          (entry) =>
                            entry.toLocaleLowerCase("ru") !==
                            roomName.toLocaleLowerCase("ru"),
                        )
                      : cached.destinationRooms,
                  lastSourceRoom:
                    kind === "sourceRooms" &&
                    cached.lastSourceRoom.toLocaleLowerCase("ru") ===
                      roomName.toLocaleLowerCase("ru")
                      ? (cached.sourceRooms.find(
                          (entry) =>
                            entry.toLocaleLowerCase("ru") !==
                            roomName.toLocaleLowerCase("ru"),
                        ) ?? "")
                      : cached.lastSourceRoom,
                }
              : cached,
        );
      }
    }
    const previousTasks = new Map(current.tasks.map((task) => [task.id, task]));
    const nextTasks = new Map(updated.tasks.map((task) => [task.id, task]));
    const previousBoxes = new Map(current.boxes.map((box) => [box.id, box]));
    const nextBoxes = new Map(updated.boxes.map((box) => [box.id, box]));
    const previousItems = new Map(current.items.map((item) => [item.id, item]));
    const nextItems = new Map(updated.items.map((item) => [item.id, item]));
    const removedBoxIds = new Set(
      current.boxes
        .filter((box) => !nextBoxes.has(box.id))
        .map((box) => box.id),
    );
    const addedBoxes = updated.boxes.filter(
      (box) => !previousBoxes.has(box.id),
    );

    const operations: Promise<unknown>[] = [];
    for (const task of updated.tasks) {
      const previous = previousTasks.get(task.id);
      if (!previous) {
        operations.push(
          unwrap(
            createTask({
              path: { project_id: projectId },
              body: {
                title: task.title,
                description: task.description || null,
                phase: task.stage,
                due_at: task.dueAt,
                assignee_ids: taskAssigneeIds(updated, task.assignees),
                reminder_offsets_hours: task.dueAt
                  ? (task.reminderOffsetsHours ?? [])
                  : [],
              },
            }),
          ),
        );
        continue;
      }
      if (!isServerId(task.id)) continue;
      if (
        previous.title !== task.title ||
        previous.description !== task.description ||
        previous.stage !== task.stage ||
        previous.dueAt !== task.dueAt ||
        !same(
          previous.reminderOffsetsHours ?? [],
          task.reminderOffsetsHours ?? [],
        )
      )
        operations.push(
          (async () => {
            await unwrap(
              updateTask({
                path: { task_id: task.id },
                body: {
                  title: task.title,
                  description: task.description || null,
                  phase: task.stage,
                  due_at: task.dueAt,
                },
              }),
            );
            if (
              task.dueAt &&
              !same(
                previous.reminderOffsetsHours ?? [],
                task.reminderOffsetsHours ?? [],
              )
            )
              await unwrap(
                setTaskReminders({
                  path: { task_id: task.id },
                  body: { offsets_hours: task.reminderOffsetsHours ?? [] },
                }),
              );
          })(),
        );
      if (!same(previous.assignees, task.assignees))
        operations.push(
          unwrap(
            setTaskAssignees({
              path: { task_id: task.id },
              body: { user_ids: taskAssigneeIds(updated, task.assignees) },
            }),
          ),
        );
      if (previous.done !== task.done)
        operations.push(
          unwrap(
            task.done
              ? completeTask({ path: { task_id: task.id } })
              : reopenTask({ path: { task_id: task.id } }),
          ),
        );
    }
    for (const task of current.tasks)
      if (!nextTasks.has(task.id) && isServerId(task.id))
        operations.push(unwrap(deleteTask({ path: { task_id: task.id } })));

    const createdBoxIds = new Set(addedBoxes.map((box) => box.id));
    for (const box of addedBoxes) {
      const roomId = findRoomId(updated.rooms, "DESTINATION", box.room);
      if (!roomId)
        throw new Error(`Комната «${box.room}» не найдена в проекте.`);
      const contents = updated.items.filter(
        (item) => item.boxId === box.id && item.state === "IN_BOX",
      );
      const sourceRoomId = contents[0]
        ? findRoomId(updated.rooms, "SOURCE", contents[0].sourceRoom)
        : undefined;
      if (contents.length && !sourceRoomId)
        throw new Error("Исходная комната не найдена в проекте.");
      operations.push(
        unwrap(
          createBoxApi({
            path: { project_id: projectId },
            body: {
              destination_room_id: roomId,
              title: box.title || null,
              is_fragile: box.fragile,
              ...(contents.length && sourceRoomId
                ? {
                    items: {
                      source_room_id: sourceRoomId,
                      priority: "MEDIUM" as const,
                      entries: contents.map(({ name, quantity }) => ({
                        name,
                        quantity,
                      })),
                    },
                  }
                : {}),
            },
          }),
        ),
      );
    }
    for (const box of current.boxes) {
      if (!isServerId(box.id)) continue;
      const updatedBox = nextBoxes.get(box.id);
      if (!updatedBox) {
        operations.push(unwrap(deleteBoxApi({ path: { box_id: box.id } })));
        continue;
      }
      if (
        box.title !== updatedBox.title ||
        box.fragile !== updatedBox.fragile ||
        box.room !== updatedBox.room
      ) {
        const roomId = findRoomId(
          updated.rooms,
          "DESTINATION",
          updatedBox.room,
        );
        operations.push(
          unwrap(
            updateBoxApi({
              path: { box_id: box.id },
              body: {
                title:
                  box.title === updatedBox.title
                    ? undefined
                    : updatedBox.title || null,
                is_fragile:
                  box.fragile === updatedBox.fragile
                    ? undefined
                    : updatedBox.fragile,
                destination_room_id:
                  box.room === updatedBox.room ? undefined : roomId,
              },
            }),
          ),
        );
      }
      if (box.status !== updatedBox.status)
        operations.push(
          unwrap(
            setBoxStatusApi({
              path: { box_id: box.id },
              body: { status: toApiBoxStatus(updatedBox.status) },
            }),
          ),
        );
    }

    for (const item of updated.items) {
      const previous = previousItems.get(item.id);
      if (!previous) {
        if (item.boxId && createdBoxIds.has(item.boxId)) continue;
        const sourceRoomId = findRoomId(
          updated.rooms,
          "SOURCE",
          item.sourceRoom,
        );
        if (!sourceRoomId)
          throw new Error(`Исходная комната «${item.sourceRoom}» не найдена.`);
        operations.push(
          unwrap(
            createItemApi({
              path: { project_id: projectId },
              body: {
                name: item.name,
                source_room_id: sourceRoomId,
                quantity: item.quantity,
                priority: toApiItemPriority(item.priority),
                ...(item.state === "IN_BOX" && item.boxId
                  ? { box_id: item.boxId }
                  : {}),
              },
            }),
          ),
        );
        continue;
      }
      if (!isServerId(item.id)) continue;
      if (removedBoxIds.has(previous.boxId ?? "")) continue;
      if (
        previous.name !== item.name ||
        previous.quantity !== item.quantity ||
        previous.priority !== item.priority
      )
        operations.push(
          unwrap(
            updateItemApi({
              path: { item_id: item.id },
              body: {
                name: item.name,
                quantity: item.quantity,
                priority: toApiItemPriority(item.priority),
              },
            }),
          ),
        );
      if (previous.state !== item.state || previous.boxId !== item.boxId)
        operations.push(
          unwrap(
            setItemState({
              path: { item_id: item.id },
              body: {
                state: toApiItemState(item.state),
                ...(item.state === "IN_BOX" && item.boxId
                  ? { box_id: item.boxId }
                  : {}),
              },
            }),
          ),
        );
    }
    for (const item of current.items)
      if (
        !nextItems.has(item.id) &&
        isServerId(item.id) &&
        !removedBoxIds.has(item.boxId ?? "")
      )
        operations.push(unwrap(deleteItemApi({ path: { item_id: item.id } })));

    await Promise.all(operations);
    await refreshProjectData(projectId);
  };

  const updateProject = async (apply: (current: Project) => Project) => {
    if (!requireOnline()) return false;
    if (!project || !projectDataQuery.data) return false;
    const updated = apply(project);
    const hasAddedBox = updated.boxes.some(
      (box) => !project.boxes.some((previous) => previous.id === box.id),
    );
    const hasRemovedBox = project.boxes.some(
      (box) => !updated.boxes.some((next) => next.id === box.id),
    );
    const hasAddedTask = updated.tasks.some(
      (task) => !project.tasks.some((previous) => previous.id === task.id),
    );
    const hasRemovedTask = project.tasks.some(
      (task) => !updated.tasks.some((next) => next.id === task.id),
    );
    const hasAddedItem = updated.items.some(
      (item) => !project.items.some((previous) => previous.id === item.id),
    );
    const hasRemovedItem = project.items.some(
      (item) => !updated.items.some((next) => next.id === item.id),
    );
    const changeLabel =
      hasAddedBox || hasRemovedBox
        ? "Коробка"
        : hasAddedTask || hasRemovedTask
          ? "Задача"
          : hasAddedItem || hasRemovedItem
            ? "Вещь"
            : null;
    const isAddition = hasAddedBox || hasAddedTask || hasAddedItem;
    const previousData = projectDataQuery.data;
    const optimisticData = queryClient.setQueryData<ProjectData>(
      QUERY_KEYS.PROJECT_DATA(project.id),
      (current) =>
        current
          ? {
              ...current,
              rooms: updated.rooms,
              sourceRooms: updated.sourceRooms,
              lastSourceRoom: updated.lastSourceRoom,
              destinationRooms: updated.destinationRooms,
              boxes: updated.boxes,
              nextBoxNumber: updated.nextBoxNumber,
              items: updated.items,
              tasks: updated.tasks,
            }
          : current,
    );
    if (updated.lastSourceRoom !== project.lastSourceRoom)
      patchStored((current) => ({
        ...current,
        data: {
          ...current.data,
          [project.id]: {
            ...current.data[project.id],
            lastSourceRoom: updated.lastSourceRoom,
          },
        },
      }));
    try {
      const save = syncProjectChanges(project, updated);
      if (changeLabel)
        await toast.promise(save, {
          loading: "Сохраняем изменения…",
          success: `${changeLabel} ${isAddition ? "добавлена" : "удалена"}`,
          error: "Не удалось сохранить изменения",
        });
      else await save;
      return true;
    } catch (error: unknown) {
      setMutationError(
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Не удалось сохранить изменения.",
      );
      if (
        queryClient.getQueryData(QUERY_KEYS.PROJECT_DATA(project.id)) ===
        optimisticData
      )
        queryClient.setQueryData(
          QUERY_KEYS.PROJECT_DATA(project.id),
          previousData,
        );
      await refreshProjectData(project.id);
      return false;
    }
  };

  const changeBoxStatus = async (boxId: string, status: Status) => {
    if (!requireOnline()) return false;
    if (!project) return false;
    try {
      const confirmedBox = await unwrap(
        setBoxStatusApi({
          path: { box_id: boxId },
          body: { status: toApiBoxStatus(status) },
        }),
      );
      if (confirmedBox.status !== toApiBoxStatus(status))
        throw new Error("Сервер не подтвердил новый статус коробки.");

      queryClient.setQueryData<ProjectData>(
        QUERY_KEYS.PROJECT_DATA(project.id),
        (current) =>
          current
            ? {
                ...current,
                boxes: current.boxes.map((box) =>
                  box.id === boxId ? { ...box, status } : box,
                ),
              }
            : current,
      );
      await refreshProjectData(project.id);
      const visibleStatus = queryClient
        .getQueryData<ProjectData>(QUERY_KEYS.PROJECT_DATA(project.id))
        ?.boxes.find((box) => box.id === boxId)?.status;
      if (visibleStatus !== status) {
        setMutationError(
          "Статус коробки не подтвердился при обновлении данных.",
        );
        return false;
      }
      return true;
    } catch (error) {
      setMutationError(apiErrorMessage(error));
      await refreshProjectData(project.id);
      return false;
    }
  };

  const createProject = async (values: ProjectFormValues) => {
    if (!requireOnline()) return;
    await toast.promise(
      (async () => {
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
        if (values.templateIds.length)
          try {
            await unwrap(
              createTasksFromTemplates({
                path: { project_id: response.id },
                body: { template_ids: values.templateIds },
              }),
            );
          } catch (error) {
            setMutationError(apiErrorMessage(error));
          }
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
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.PROJECT_DATA(response.id),
        });
        router.replace(pages.DASHBOARD);
      })(),
      {
        loading: "Создаём проект…",
        success: "Проект создан",
        error: "Не удалось создать проект",
      },
    );
  };

  const updateProjectMeta: ProjectsContextValue["updateProjectMeta"] = async (
    values,
  ) => {
    if (!requireOnline()) return;
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
    if (!requireOnline()) return;
    if (!project) return;
    await toast.promise(
      (async () => {
        await unwrap(
          addCollaboratorApi({
            path: { project_id: project.id },
            body: { username: username.trim().toLowerCase() },
          }),
        );
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
      })(),
      {
        loading: "Добавляем участника…",
        success: "Участник добавлен",
        error: "Не удалось добавить участника",
      },
    );
  };

  const removeCollaborator = async (userId: string, username: string) => {
    if (!requireOnline()) return;
    if (!project) return;
    await toast.promise(
      (async () => {
        await Promise.all(
          project.tasks
            .filter((task) => task.assignees.includes(username))
            .map((task) =>
              unwrap(
                setTaskAssignees({
                  path: { task_id: task.id },
                  body: {
                    user_ids: taskAssigneeIds(
                      project,
                      task.assignees.filter((name) => name !== username),
                    ),
                  },
                }),
              ),
            ),
        );
        await unwrap(
          removeCollaboratorApi({
            path: { project_id: project.id, user_id: userId },
          }),
        );
        await refreshProjectData(project.id);
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
      })(),
      {
        loading: "Удаляем участника…",
        success: "Участник удалён",
        error: "Не удалось удалить участника",
      },
    );
  };

  const deleteProject = async () => {
    if (!requireOnline()) return;
    if (!project) return;
    await toast.promise(
      (async () => {
        await unwrap(deleteProjectApi({ path: { project_id: project.id } }));
        const fallback =
          projects.find((item) => item.id !== project.id) ?? null;
        patchStored((current) => {
          const data = { ...current.data };
          delete data[project.id];
          return { ...current, data, activeId: fallback?.id ?? null };
        });
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
        router.replace(fallback ? pages.DASHBOARD : pages.PROJECTS);
      })(),
      {
        loading: "Удаляем проект…",
        success: "Проект удалён",
        error: "Не удалось удалить проект",
      },
    );
  };

  const addBox = (values: BoxFormValues) => {
    const items = values.items
      .map((item) => ({ ...item, name: item.name.trim() }))
      .filter((item) => item.name);
    const title = values.title.trim();
    return updateProject((current) => {
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
    return updateProject((current) => ({
      ...current,
      tasks: [
        ...current.tasks,
        {
          id: uid("task"),
          title: values.title.trim(),
          description: values.description.trim(),
          stage: values.stage as TaskStage,
          assignees: values.assignees,
          dueAt: toApiDueAt(values.dueDate, values.dueTime),
          reminderOffsetsHours: values.dueDate
            ? [...new Set(values.reminderOffsets.map(Number))].sort(
                (a, b) => a - b,
              )
            : [],
          done: false,
        },
      ],
    }));
  };

  return (
    <ProjectsContext.Provider
      value={{
        canEdit,
        ready,
        projects,
        project,
        activeId,
        setActiveId,
        createProject,
        updateProject,
        changeBoxStatus,
        updateProjectMeta,
        addCollaborator,
        removeCollaborator,
        deleteProject,
        addBox,
        addTask,
      }}
    >
      {mutationError && (
        <div
          role="alert"
          className="fixed right-4 bottom-4 z-[100] flex max-w-lg items-center gap-4 rounded-md bg-[#A84D3C] px-4 py-3 text-sm font-bold text-white shadow-lg"
        >
          <span>{mutationError}</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={() => setMutationError(null)}
          >
            Закрыть
          </Button>
        </div>
      )}
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
