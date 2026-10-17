import type { LucideIcon } from "lucide-react";
import { Archive, FileText, House, PackageOpen } from "lucide-react";
import type { Room } from "@/configs/types/room.type";

export const rooms: { name: Room; Icon: LucideIcon }[] = [
  { name: "Кухня", Icon: PackageOpen },
  { name: "Кабинет", Icon: FileText },
  { name: "Спальня", Icon: House },
  { name: "Гостиная", Icon: Archive },
];

export const roomOptions: { label: Room; value: Room }[] = rooms.map(
  ({ name }) => ({ label: name, value: name }),
);
