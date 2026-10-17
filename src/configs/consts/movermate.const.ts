import {
  Archive,
  Box,
  CheckSquare2,
  FileText,
  House,
  type LucideIcon,
  PackageOpen,
  QrCode,
  Truck,
} from "lucide-react";

export type Room = "Кухня" | "Кабинет" | "Спальня" | "Гостиная";
export type Status = "packing" | "packed" | "loaded" | "delivered" | "unpacked";
export type View = "dashboard" | "boxes" | "plan" | "labels" | "progress";
export type TaskStage = "before" | "moving" | "after";
export type QrStrategy = "protected" | "open";

export type Item = {
  id: string;
  name: string;
  unpacked: boolean;
  lost: boolean;
};
export type MoveBox = {
  id: string;
  title: string;
  room: Room;
  fragile: boolean;
  deferred: boolean;
  status: Status;
  salt: string;
  items: Item[];
};
export type Task = {
  id: string;
  title: string;
  stage: TaskStage;
  assignee: string;
  due: string;
  done: boolean;
};
export type Project = {
  id: string;
  name: string;
  date: string;
  from: string;
  to: string;
  qrCodeStrategy: QrStrategy;
  boxes: MoveBox[];
  tasks: Task[];
  firstDay: { id: string; title: string; done: boolean }[];
  roomsLoaded: Record<Room, boolean>;
};
export type Account = { username: string; token: string };

export const STORAGE_KEY = "movermate-demo-v1";

export const rooms: { name: Room; Icon: LucideIcon }[] = [
  { name: "Кухня", Icon: PackageOpen },
  { name: "Кабинет", Icon: FileText },
  { name: "Спальня", Icon: House },
  { name: "Гостиная", Icon: Archive },
];

export const statuses: { key: Status; label: string; color: string }[] = [
  { key: "packing", label: "Собирается", color: "bg-[#E8E2D5] text-[#4E5752]" },
  { key: "packed", label: "Собрана", color: "bg-[#E2E9DD] text-[#42664D]" },
  { key: "loaded", label: "Погружена", color: "bg-[#F3E7C8] text-[#77602B]" },
  {
    key: "delivered",
    label: "Доставлена",
    color: "bg-[#E4ECE7] text-[#3D6B4C]",
  },
  { key: "unpacked", label: "Распакована", color: "bg-[#42664D] text-white" },
];

export const navigation: { id: View; label: string; Icon: LucideIcon }[] = [
  { id: "dashboard", label: "Обзор", Icon: House },
  { id: "boxes", label: "Коробки", Icon: Box },
  { id: "plan", label: "План", Icon: CheckSquare2 },
  { id: "labels", label: "Этикетки", Icon: QrCode },
  { id: "progress", label: "Прогресс", Icon: Truck },
];

export { Box };

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatDate(value: string, includeYear = false) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    ...(includeYear ? { year: "numeric" } : {}),
  }).format(date);
}

export function plural(count: number, forms: [string, string, string]) {
  const rule = new Intl.PluralRules("ru-RU").select(count);
  if (rule === "one") return forms[0];
  if (rule === "few") return forms[1];
  return forms[2];
}

export function createEmptyProject(
  values: Pick<Project, "name" | "date" | "from" | "to">,
): Project {
  return {
    id: uid("project"),
    ...values,
    qrCodeStrategy: "protected",
    boxes: [],
    tasks: [],
    firstDay: [
      { id: uid("first"), title: "Документы и ключи", done: false },
      { id: uid("first"), title: "Зарядки и пауэрбанк", done: false },
      { id: uid("first"), title: "Аптечка", done: false },
    ],
    roomsLoaded: {
      Кухня: false,
      Кабинет: false,
      Спальня: false,
      Гостиная: false,
    },
  };
}

export function createDemoProject(): Project {
  const project = createEmptyProject({
    name: "Переезд в новую квартиру",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18)
      .toISOString()
      .slice(0, 10),
    from: "ул. Ленина, 14",
    to: "ул. Садовая, 8",
  });

  return {
    ...project,
    boxes: [
      {
        id: "BOX-101",
        title: "Посуда на первое время",
        room: "Кухня",
        fragile: true,
        deferred: false,
        status: "packed",
        salt: uid("salt"),
        items: [
          { id: uid("item"), name: "Кружки", unpacked: false, lost: false },
          { id: uid("item"), name: "Тарелки", unpacked: false, lost: false },
          { id: uid("item"), name: "Чайник", unpacked: false, lost: false },
        ],
      },
      {
        id: "BOX-102",
        title: "Рабочее место",
        room: "Кабинет",
        fragile: false,
        deferred: false,
        status: "loaded",
        salt: uid("salt"),
        items: [
          {
            id: uid("item"),
            name: "Зарядка ноутбука",
            unpacked: false,
            lost: false,
          },
          { id: uid("item"), name: "Документы", unpacked: false, lost: false },
        ],
      },
      {
        id: "BOX-103",
        title: "Текстиль и одежда",
        room: "Спальня",
        fragile: false,
        deferred: false,
        status: "delivered",
        salt: uid("salt"),
        items: [
          {
            id: uid("item"),
            name: "Постельное белье",
            unpacked: true,
            lost: false,
          },
          {
            id: uid("item"),
            name: "Зимняя одежда",
            unpacked: false,
            lost: false,
          },
        ],
      },
      {
        id: "BOX-104",
        title: "Хрупкий декор",
        room: "Гостиная",
        fragile: true,
        deferred: true,
        status: "packing",
        salt: uid("salt"),
        items: [],
      },
    ],
    tasks: [
      {
        id: uid("task"),
        title: "Заказать грузчиков",
        stage: "before",
        assignee: "Алексей",
        due: "Через 3 дня",
        done: false,
      },
      {
        id: uid("task"),
        title: "Подготовить документы и ключи",
        stage: "moving",
        assignee: "",
        due: "В день переезда",
        done: false,
      },
      {
        id: uid("task"),
        title: "Проверить счетчики",
        stage: "after",
        assignee: "",
        due: "После переезда",
        done: false,
      },
    ],
  };
}
