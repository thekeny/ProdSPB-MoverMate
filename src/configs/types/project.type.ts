import type { MoveBox, QrStrategy } from "@/configs/types/box.type";
import type { Room } from "@/configs/types/room.type";
import type { FirstDayItem, Task } from "@/configs/types/task.type";

export type Project = {
  id: string;
  name: string;
  date: string;
  from: string;
  to: string;
  qrCodeStrategy: QrStrategy;
  boxes: MoveBox[];
  tasks: Task[];
  firstDay: FirstDayItem[];
  roomsLoaded: Record<Room, boolean>;
};

export type ProjectFlowMode = "select" | "create";
