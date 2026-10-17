import type { TaskStage } from "@/configs/types/task.type";

export const TASK_TEMPLATES: { id: string; title: string; stage: TaskStage }[] =
  [
    {
      id: "management",
      title: "Уведомить управляющую компанию",
      stage: "BEFORE",
    },
    { id: "meters", title: "Сфотографировать счётчики", stage: "DURING" },
    { id: "delivery", title: "Проверить доставку коробок", stage: "AFTER" },
  ];
