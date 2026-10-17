export type TaskStage = "BEFORE" | "DURING" | "AFTER";

export type Task = {
  id: string;
  title: string;
  description: string;
  stage: TaskStage;
  assignees: string[];
  dueAt: string | null;
  done: boolean;
};
