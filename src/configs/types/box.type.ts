import type { Room } from "@/configs/types/room.type";

export type Status = "packing" | "packed" | "loaded" | "delivered";
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
