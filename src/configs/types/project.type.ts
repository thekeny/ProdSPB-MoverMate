import type { Room } from "@/api/generated/types.gen";
import type { Item, MoveBox, QrStrategy } from "@/configs/types/box.type";
import type { Task } from "@/configs/types/task.type";

export type Collaborator = {
  userId: string;
  username: string;
  isOwner: boolean;
};

export type ProjectLocalData = {
  sourceRooms: string[];
  lastSourceRoom: string;
  destinationRooms: string[];
  boxes: MoveBox[];
  nextBoxNumber: number;
  items: Item[];
  tasks: Task[];
};

export type Project = ProjectLocalData & {
  rooms: Room[];
  id: string;
  ownerId: string;
  isOwner: boolean;
  name: string;
  date: string;
  from: string;
  to: string;
  qrCodeStrategy: QrStrategy;
  timeZone: string;
  reminderOffsetsDays: number[];
  collaborators: Collaborator[];
  members: string[];
};

export type ProjectFlowMode = "select" | "create";
