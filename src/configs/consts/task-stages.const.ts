import type { TaskStage } from "@/configs/types/task.type";

export const TASK_STAGE_OPTIONS: { value: TaskStage; label: string }[] = [
  { value: "before", label: "До переезда" },
  { value: "moving", label: "День переезда" },
  { value: "after", label: "После переезда" },
];
