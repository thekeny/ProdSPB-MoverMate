import type { QrStrategy } from "@/configs/types/box.type";

export const QR_STRATEGY_OPTIONS: { value: QrStrategy; label: string }[] = [
  { value: "protected", label: "Защищённый — вход по аккаунту" },
  { value: "open", label: "Открытый — вход по коду коробки" },
];
