import type { Item, MoveBox, QrStrategy } from "@/configs/types/box.type";
import type { Task } from "@/configs/types/task.type";

export type Project = {
  id: string;
  ownerId: string;
  name: string;
  date: string;
  from: string;
  to: string;
  qrCodeStrategy: QrStrategy;
  sourceRooms: string[];
  lastSourceRoom: string;
  destinationRooms: string[];
  members: string[];
  boxes: MoveBox[];
  nextBoxNumber: number;
  items: Item[];
  tasks: Task[];
};

export type ProjectFlowMode = "select" | "create";
