export type Status = "packing" | "packed" | "loaded" | "delivered" | "unpacked";
export type QrStrategy = "protected" | "open";
export type ItemState = "TO_PACK" | "IN_BOX" | "TAKEN_OUT" | "LOST";
export type ItemPriority = "NORMAL" | "FIRST_NECESSITY";

export type Item = {
  id: string;
  name: string;
  state: ItemState;
  sourceRoom: string;
  boxId: string | null;
  quantity: number;
  priority: ItemPriority;
};

export type MoveBox = {
  id: string;
  number: number;
  qrToken: string;
  title: string;
  room: string;
  sourceRooms: string[];
  fragile: boolean;
  status: Status;
};
