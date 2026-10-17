import type { QrStrategy } from "@/configs/types/box.type";

export const QR_STRATEGY_OPTIONS: { value: QrStrategy; label: string }[] = [
  { value: "protected", label: "Только участники проекта" },
  {
    value: "open",
    label: "Любой со ссылкой может посмотреть; менять могут участники",
  },
];
