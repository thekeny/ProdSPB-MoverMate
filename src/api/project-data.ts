import {
  getLoadingChecklist,
  listBoxes,
  listItems,
  listRooms,
  listTasks,
} from "@/api/generated";
import type {
  Item as ApiItem,
  Task as ApiTask,
  Box,
  BoxStatus,
  ItemState,
  Room,
} from "@/api/generated/types.gen";
import { unwrap } from "@/api/request";
import type { Item, MoveBox, Status } from "@/configs/types/box.type";
import type { ProjectLocalData } from "@/configs/types/project.type";
import type { Task } from "@/configs/types/task.type";

export type ProjectData = ProjectLocalData & { rooms: Room[] };

const boxStatusMap: Record<BoxStatus, Status> = {
  PACKING: "packing",
  PACKED: "packed",
  LOADED: "loaded",
  DELIVERED: "delivered",
  UNPACKED: "unpacked",
};

const apiBoxStatusMap: Record<Status, BoxStatus> = {
  packing: "PACKING",
  packed: "PACKED",
  loaded: "LOADED",
  delivered: "DELIVERED",
  unpacked: "UNPACKED",
};

export function toApiBoxStatus(status: Status): BoxStatus {
  return apiBoxStatusMap[status];
}

export function toApiItemState(state: Item["state"]): ItemState {
  return state;
}

export function toApiItemPriority(priority: Item["priority"]) {
  return priority === "FIRST_NECESSITY" ? "FIRST_NECESSITY" : "MEDIUM";
}

function mapBox(box: Box, sourceRoomsByBox: Map<string, string[]>): MoveBox {
  return {
    id: box.id,
    number: box.number,
    qrToken: box.qr_token,
    title: box.title ?? "",
    room: box.destination_room.name,
    sourceRooms: sourceRoomsByBox.get(box.id) ?? [],
    fragile: box.is_fragile,
    status: boxStatusMap[box.status],
    contentsReminderAt: box.contents_reminder_at,
    createdById: box.created_by.id,
  };
}

export function mapItem(item: ApiItem): Item {
  return {
    id: item.id,
    name: item.name,
    state: item.state,
    sourceRoom: item.source_room.name,
    boxId: item.box?.id ?? null,
    quantity: item.quantity,
    priority:
      item.priority === "FIRST_NECESSITY" ? "FIRST_NECESSITY" : "NORMAL",
  };
}

export function mapTask(task: ApiTask): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? "",
    stage: task.phase,
    assignees: task.assignees.map((assignee) => assignee.username),
    dueAt: task.due_at,
    reminderOffsetsHours: task.reminder_offsets_hours,
    done: task.is_done,
  };
}

export function toApiDueAt(date: string, time: string): string | null {
  if (!date) return null;
  const parsed = new Date(`${date}T${time || "00:00"}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export async function getProjectData(projectId: string): Promise<ProjectData> {
  const [rooms, rawItems, rawTasks, checklist, rawBoxes] = await Promise.all([
    unwrap(listRooms({ path: { project_id: projectId } })),
    getAllItems(projectId),
    unwrap(listTasks({ path: { project_id: projectId } })),
    unwrap(getLoadingChecklist({ path: { project_id: projectId } })),
    getAllBoxes(projectId),
  ]);
  const items = rawItems.map(mapItem);
  const sourceRoomsByBox = new Map<string, string[]>();
  for (const room of checklist)
    for (const box of room.boxes)
      sourceRoomsByBox.set(box.id, [
        ...(sourceRoomsByBox.get(box.id) ?? []),
        room.room.name,
      ]);
  for (const item of items)
    if (item.boxId) {
      const names = sourceRoomsByBox.get(item.boxId) ?? [];
      if (!names.includes(item.sourceRoom)) names.push(item.sourceRoom);
      sourceRoomsByBox.set(item.boxId, names);
    }
  const boxes = rawBoxes
    .map((box) => mapBox(box, sourceRoomsByBox))
    .sort((a, b) => b.number - a.number);
  const sourceRooms = rooms
    .filter((room) => room.kind === "SOURCE")
    .map((room) => room.name);
  const destinationRooms = rooms
    .filter((room) => room.kind === "DESTINATION")
    .map((room) => room.name);
  return {
    rooms,
    sourceRooms,
    lastSourceRoom: sourceRooms[0] ?? "",
    destinationRooms,
    boxes,
    nextBoxNumber: boxes.reduce(
      (next, box) => Math.max(next, box.number + 1),
      1,
    ),
    items,
    tasks: rawTasks.map(mapTask),
  };
}

async function getAllItems(projectId: string) {
  const results: ApiItem[] = [];
  let after: string | undefined;
  do {
    const page = await unwrap(
      listItems({
        path: { project_id: projectId },
        query: { limit: 100, after },
      }),
    );
    results.push(...page.results);
    after = page.next_cursor ?? undefined;
  } while (after);
  return results;
}

async function getAllBoxes(projectId: string) {
  const results: Box[] = [];
  let after: string | undefined;
  do {
    const page = await unwrap(
      listBoxes({
        path: { project_id: projectId },
        query: { limit: 100, after },
      }),
    );
    results.push(...page.results);
    after = page.next_cursor ?? undefined;
  } while (after);
  return results;
}

export function findRoomId(rooms: Room[], kind: Room["kind"], name: string) {
  return rooms.find((room) => room.kind === kind && room.name === name)?.id;
}
