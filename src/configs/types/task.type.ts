export type TaskStage = "before" | "moving" | "after";

export type Task = {
  id: string;
  title: string;
  stage: TaskStage;
  assignee: string;
  due: string;
  done: boolean;
};

export type FirstDayItem = { id: string; title: string; done: boolean };
