import {
  type Account,
  type Item,
  type MoveBox,
  type Project,
  type Room,
  rooms,
  type Status,
  type Task,
  type TaskStage,
  uid,
} from "@/configs/consts/movermate.const";

const statusKeys: Status[] = [
  "packing",
  "packed",
  "loaded",
  "delivered",
  "unpacked",
];
const taskStages: TaskStage[] = ["before", "moving", "after"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function normalizeItem(raw: unknown): Item | null {
  if (!isRecord(raw) || !stringValue(raw.id) || !stringValue(raw.name)) {
    return null;
  }
  return {
    id: stringValue(raw.id),
    name: stringValue(raw.name),
    unpacked: raw.unpacked === true,
    lost: raw.lost === true,
  };
}

function normalizeBox(raw: unknown): MoveBox | null {
  if (!isRecord(raw) || !stringValue(raw.id) || !stringValue(raw.title)) {
    return null;
  }
  const room = stringValue(raw.room) as Room;
  const status = stringValue(raw.status) as Status;
  return {
    id: stringValue(raw.id),
    title: stringValue(raw.title),
    room: rooms.some((entry) => entry.name === room) ? room : rooms[0].name,
    fragile: raw.fragile === true,
    deferred: raw.deferred === true,
    status: statusKeys.includes(status) ? status : "packing",
    salt: stringValue(raw.salt) || uid("salt"),
    items: Array.isArray(raw.items)
      ? raw.items
          .map(normalizeItem)
          .filter((item): item is Item => item !== null)
      : [],
  };
}

function normalizeTask(raw: unknown): Task | null {
  if (!isRecord(raw) || !stringValue(raw.id) || !stringValue(raw.title)) {
    return null;
  }
  const stage = stringValue(raw.stage) as TaskStage;
  return {
    id: stringValue(raw.id),
    title: stringValue(raw.title),
    stage: taskStages.includes(stage) ? stage : "before",
    assignee: stringValue(raw.assignee),
    due: stringValue(raw.due) || "По плану",
    done: raw.done === true,
  };
}

export function normalizeProject(raw: unknown): Project | null {
  if (!isRecord(raw) || !stringValue(raw.id) || !stringValue(raw.name)) {
    return null;
  }
  const rawRooms = isRecord(raw.roomsLoaded) ? raw.roomsLoaded : {};
  const firstDay = Array.isArray(raw.firstDay)
    ? raw.firstDay
        .filter(isRecord)
        .filter((item) => stringValue(item.id) && stringValue(item.title))
        .map((item) => ({
          id: stringValue(item.id),
          title: stringValue(item.title),
          done: item.done === true,
        }))
    : [];
  return {
    id: stringValue(raw.id),
    name: stringValue(raw.name),
    date: stringValue(raw.date),
    from: stringValue(raw.from),
    to: stringValue(raw.to),
    qrCodeStrategy: raw.qrCodeStrategy === "open" ? "open" : "protected",
    boxes: Array.isArray(raw.boxes)
      ? raw.boxes
          .map(normalizeBox)
          .filter((box): box is MoveBox => box !== null)
      : [],
    tasks: Array.isArray(raw.tasks)
      ? raw.tasks
          .map(normalizeTask)
          .filter((task): task is Task => task !== null)
      : [],
    firstDay,
    roomsLoaded: Object.fromEntries(
      rooms.map(({ name }) => [name, rawRooms[name] === true]),
    ) as Record<Room, boolean>,
  };
}

export function normalizeAccount(raw: unknown): Account | null {
  if (!isRecord(raw) || !stringValue(raw.username) || !stringValue(raw.token)) {
    return null;
  }
  return { username: stringValue(raw.username), token: stringValue(raw.token) };
}
