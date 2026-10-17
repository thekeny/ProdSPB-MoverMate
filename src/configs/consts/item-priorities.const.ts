import type { ItemPriority } from "@/configs/types/box.type";

export const ITEM_PRIORITY_OPTIONS: { value: ItemPriority; label: string }[] = [
  { value: "NORMAL", label: "Обычная" },
  { value: "FIRST_NECESSITY", label: "Первый день" },
];
