import { ROOM_PRESETS } from "@/configs/consts/rooms.const";
import type { Item, MoveBox, Status } from "@/configs/types/box.type";
import type { Project } from "@/configs/types/project.type";
import type { Task, TaskStage } from "@/configs/types/task.type";
import { uid } from "@/lib/id";

const statusKeys: Status[] = [
  "packing",
  "packed",
  "loaded",
  "delivered",
  "unpacked",
];
const taskStages: TaskStage[] = ["BEFORE", "DURING", "AFTER"];

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function string(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function positiveInteger(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0
    ? value
    : fallback;
}

function names(value: unknown, fallback: readonly string[]) {
  const entries = Array.isArray(value)
    ? value.map((entry) => string(entry).trim()).filter(Boolean)
    : [];
  return [...new Set(entries.length ? entries : fallback)];
}

function normalizeBox(raw: unknown, number: number): MoveBox | null {
  if (!record(raw) || !string(raw.id) || !string(raw.title)) return null;
  const rawStatus = string(raw.status);
  const status = rawStatus;
  const safeStatus = statusKeys.includes(status as Status)
    ? (status as Status)
    : "packing";
  return {
    id: string(raw.id),
    number,
    qrToken: string(raw.qrToken) || uid("qr"),
    title: string(raw.title),
    room: string(raw.room) || ROOM_PRESETS[0],
    sourceRooms: names(raw.sourceRooms, [ROOM_PRESETS[0]]),
    fragile: raw.fragile === true,
    status: safeStatus,
  };
}

function normalizeItem(
  raw: unknown,
  boxId: string | null,
  sourceRoom: string,
): Item | null {
  if (!record(raw) || !string(raw.id) || !string(raw.name)) return null;
  const rawState = string(raw.state);
  const state = ["TO_PACK", "IN_BOX", "TAKEN_OUT", "LOST"].includes(rawState)
    ? (rawState as Item["state"])
    : raw.lost === true
      ? "LOST"
      : raw.unpacked === true
        ? "TAKEN_OUT"
        : boxId
          ? "IN_BOX"
          : "TO_PACK";
  const storedBoxId = string(raw.boxId) || boxId;
  return {
    id: string(raw.id),
    name: string(raw.name),
    state: state === "IN_BOX" && !storedBoxId ? "TO_PACK" : state,
    sourceRoom: string(raw.sourceRoom) || sourceRoom,
    boxId: state === "IN_BOX" ? storedBoxId : null,
    quantity: positiveInteger(raw.quantity, 1),
    priority: raw.priority === "FIRST_NECESSITY" ? "FIRST_NECESSITY" : "NORMAL",
  };
}

function normalizeTask(raw: unknown): Task | null {
  if (!record(raw) || !string(raw.id) || !string(raw.title)) return null;
  const oldStage = string(raw.stage);
  const stage =
    oldStage === "moving"
      ? "DURING"
      : oldStage === "after"
        ? "AFTER"
        : oldStage === "before"
          ? "BEFORE"
          : oldStage;
  const dueAt = string(raw.dueAt);
  return {
    id: string(raw.id),
    title: string(raw.title),
    description:
      string(raw.description) ||
      (string(raw.due) ? `Прежний срок: ${string(raw.due)}` : ""),
    stage: taskStages.includes(stage as TaskStage)
      ? (stage as TaskStage)
      : "BEFORE",
    assignees: names(
      raw.assignees,
      string(raw.assignee) ? [string(raw.assignee)] : [],
    ),
    dueAt: /^\d{4}-\d{2}-\d{2}/.test(dueAt) ? dueAt : null,
    done: raw.done === true,
  };
}

export function normalizeProject(raw: unknown, ownerId = ""): Project | null {
  if (!record(raw) || !string(raw.id) || !string(raw.name)) return null;
  const oldBoxes = Array.isArray(raw.boxes)
    ? raw.boxes.filter(
        (entry) => record(entry) && string(entry.id) && string(entry.title),
      )
    : [];
  const usedNumbers = new Set<number>();
  let nextNumber = 1;
  const boxes = oldBoxes
    .map((entry) => {
      const existing = record(entry) ? positiveInteger(entry.number, 0) : 0;
      const number = existing && !usedNumbers.has(existing) ? existing : 0;
      if (number) usedNumbers.add(number);
      return { entry, number };
    })
    .reverse()
    .map(({ entry, number }) => {
      if (!number) {
        while (usedNumbers.has(nextNumber)) nextNumber++;
        number = nextNumber++;
        usedNumbers.add(number);
      }
      return normalizeBox(entry, number);
    })
    .reverse()
    .filter((box): box is MoveBox => box !== null);
  const sourceRooms = names(raw.sourceRooms, ROOM_PRESETS);
  const destinationRooms = names(raw.destinationRooms, [
    ...ROOM_PRESETS,
    ...boxes.map((box) => box.room),
  ]);
  const sourceRoom = sourceRooms[0] ?? ROOM_PRESETS[0];
  const savedItems = Array.isArray(raw.items)
    ? raw.items.map((entry) => normalizeItem(entry, null, sourceRoom))
    : oldBoxes.flatMap((entry) =>
        record(entry) && Array.isArray(entry.items)
          ? entry.items.map((item) =>
              normalizeItem(item, string(entry.id), sourceRoom),
            )
          : [],
      );
  const items = savedItems
    .filter((item): item is Item => item !== null)
    .map((item) =>
      item.boxId && !boxes.some((box) => box.id === item.boxId)
        ? { ...item, boxId: null, state: "TO_PACK" as const }
        : item,
    );
  if (!Array.isArray(raw.items) && Array.isArray(raw.firstDay)) {
    for (const entry of raw.firstDay) {
      if (record(entry) && string(entry.title))
        items.push({
          id: string(entry.id) || uid("item"),
          name: string(entry.title),
          state: entry.done === true ? "TAKEN_OUT" : "TO_PACK",
          sourceRoom,
          boxId: null,
          quantity: 1,
          priority: "FIRST_NECESSITY",
        });
    }
  }
  const tasks = Array.isArray(raw.tasks)
    ? raw.tasks.map(normalizeTask).filter((task): task is Task => task !== null)
    : [];
  return {
    id: string(raw.id),
    ownerId: string(raw.ownerId) || ownerId,
    name: string(raw.name),
    date: string(raw.date),
    from: string(raw.from),
    to: string(raw.to),
    qrCodeStrategy: raw.qrCodeStrategy === "open" ? "open" : "protected",
    sourceRooms,
    lastSourceRoom: sourceRooms.includes(string(raw.lastSourceRoom))
      ? string(raw.lastSourceRoom)
      : sourceRoom,
    destinationRooms,
    members: names(
      raw.members,
      tasks.flatMap((task) => task.assignees),
    ),
    boxes,
    nextBoxNumber: Math.max(
      positiveInteger(raw.nextBoxNumber, 1),
      ...boxes.map((box) => box.number + 1),
    ),
    items,
    tasks,
  };
}
