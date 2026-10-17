import type { TaskStage } from "@/configs/types/task.type";

export const TASK_STAGE_OPTIONS: { value: TaskStage; label: string }[] = [
  { value: "BEFORE", label: "До переезда" },
  { value: "DURING", label: "День переезда" },
  { value: "AFTER", label: "После переезда" },
];
