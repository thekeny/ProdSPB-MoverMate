import type { Status } from "@/configs/types/box.type";

export const statuses: { key: Status; label: string; color: string }[] = [
  { key: "packing", label: "Собирается", color: "bg-[#E8E2D5] text-[#4E5752]" },
  { key: "packed", label: "Собрана", color: "bg-[#E2E9DD] text-[#42664D]" },
  { key: "loaded", label: "Погружена", color: "bg-[#F3E7C8] text-[#77602B]" },
  {
    key: "delivered",
    label: "Доставлена",
    color: "bg-[#E4ECE7] text-[#3D6B4C]",
  },
];
