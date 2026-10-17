import { BookOpen, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { PageHeading } from "@/components/ui/page-heading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TextInput } from "@/components/ui/text-input";
import { TASK_STAGE_OPTIONS } from "@/configs/consts/task-stages.const";
import { DEFAULT_TASK_DUE } from "@/configs/consts/tasks.const";
import type { Project } from "@/configs/types/project.type";
import type { Task, TaskStage } from "@/configs/types/task.type";
import { cn } from "@/lib/utils";

function TaskEditForm({
  task,
  onClose,
  onSave,
}: {
  task: Task;
  onClose: () => void;
  onSave: (values: Pick<Task, "title" | "stage" | "assignee" | "due">) => void;
}) {
  return (
    <Modal className="max-w-md" label="Редактировать задачу" onClose={onClose}>
      <h2 className="text-2xl font-extrabold tracking-[-0.04em]">
        Редактировать задачу
      </h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const title = String(data.get("title") ?? "").trim();
          if (!title) return;
          onSave({
            title,
            stage: (data.get("stage") as TaskStage) ?? task.stage,
            assignee: String(data.get("assignee") ?? "").trim(),
            due: String(data.get("due") ?? "").trim() || DEFAULT_TASK_DUE,
          });
        }}
        className="mt-6 grid gap-4"
      >
        <Field label="Задача">
          <TextInput name="title" required defaultValue={task.title} />
        </Field>
        <Field label="Этап">
          <Select
            name="stage"
            defaultValue={task.stage}
            items={TASK_STAGE_OPTIONS}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_STAGE_OPTIONS.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Ответственный">
          <TextInput
            name="assignee"
            placeholder="Необязательно"
            defaultValue={task.assignee}
          />
        </Field>
        <Field label="Срок">
          <TextInput name="due" defaultValue={task.due} />
        </Field>
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit">Сохранить</Button>
        </div>
      </form>
    </Modal>
  );
}

export function PlanView({
  project,
  onAdd,
  onAddTemplates,
  templateNotice,
  updateProject,
}: {
  project: Project;
  onAdd: () => void;
  onAddTemplates: () => void;
  templateNotice: string | null;
  updateProject: (apply: (project: Project) => Project) => void;
}) {
  const [editing, setEditing] = useState<Task | null>(null);
  const stages: { key: TaskStage; title: string; description: string }[] = [
    {
      key: "before",
      title: "До переезда",
      description: "Подготовка дома и маршрута",
    },
    {
      key: "moving",
      title: "День переезда",
      description: "Погрузка и передача ключей",
    },
    {
      key: "after",
      title: "После переезда",
      description: "Распаковка и обустройство",
    },
  ];
  return (
    <>
      <PageHeading
        eyebrow="План"
        title="Задачи переезда"
        description="Список дел по этапам: до переезда, в день переезда и после. Отмечайте выполненное."
        action={
          <Button onClick={onAdd} className="h-11">
            <Plus />
            Новая задача
          </Button>
        }
      />
      <div className="no-print mb-5 flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          onClick={onAddTemplates}
          className="h-auto gap-2 rounded-md bg-[#E2E9DD] px-4 py-3 text-sm font-bold text-[#42664D] transition-colors duration-200 hover:bg-[#D6E1D0]"
        >
          <Sparkles className="size-4" />
          Добавить шаблон задач
        </Button>
        {templateNotice && (
          <p
            aria-live="polite"
            className="rounded-[8px] bg-[#E8E2D5] px-3 py-2 text-xs font-bold text-[#4E5752]"
          >
            {templateNotice}
          </p>
        )}
      </div>
      <section className="grid gap-4 lg:grid-cols-3">
        {stages.map((stage) => {
          const tasks = project.tasks.filter(
            (task) => task.stage === stage.key,
          );
          return (
            <div key={stage.key} className="rounded-lg bg-white p-5">
              <div className="flex items-start justify-between gap-3 rounded-md bg-[#F5F3EE] p-4">
                <div>
                  <h2 className="font-extrabold">{stage.title}</h2>
                  <p className="mt-1 text-xs text-[#68716C]">
                    {stage.description}
                  </p>
                </div>
                <span className="tnum shrink-0 rounded-full bg-[#EDF1E8] px-2.5 py-1 text-xs font-bold text-[#42664D]">
                  {tasks.filter((task) => task.done).length}/{tasks.length}
                </span>
              </div>
              <div className="mt-4 grid gap-2">
                {tasks.length ? (
                  tasks.map((task) => {
                    const checkboxId = `task-check-${task.id}`;
                    return (
                      <div
                        key={task.id}
                        className="flex gap-3 rounded-md bg-[#F5F3EE] p-3 transition-colors duration-200 hover:bg-[#EDF1E8]"
                      >
                        <Checkbox
                          id={checkboxId}
                          checked={task.done}
                          onCheckedChange={() =>
                            updateProject((current) => ({
                              ...current,
                              tasks: current.tasks.map((item) =>
                                item.id === task.id
                                  ? { ...item, done: !item.done }
                                  : item,
                              ),
                            }))
                          }
                          className="mt-0.5"
                        />
                        <label
                          htmlFor={checkboxId}
                          className="min-w-0 flex-1 cursor-pointer"
                        >
                          <span
                            className={cn(
                              "block text-xs font-bold",
                              task.done && "text-[#68716C] line-through",
                            )}
                          >
                            {task.title}
                          </span>
                          <span className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs text-[#68716C]">
                            <span>{task.assignee || "Без ответственного"}</span>
                            <span>{task.due}</span>
                          </span>
                        </label>
                        <div className="flex shrink-0 items-start gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setEditing(task)}
                            className="text-[#68716C] hover:bg-[#E8E2D5] hover:text-[#1D2923]"
                            aria-label={`Редактировать задачу: ${task.title}`}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Удалить задачу «${task.title}»?`,
                                )
                              )
                                updateProject((current) => ({
                                  ...current,
                                  tasks: current.tasks.filter(
                                    (item) => item.id !== task.id,
                                  ),
                                }));
                            }}
                            className="grid size-7 place-items-center rounded-md text-[#68716C] transition-colors hover:bg-[#E8E2D5] hover:text-[#A84D3C]"
                            aria-label={`Удалить задачу: ${task.title}`}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="py-5 text-center text-xs text-[#68716C]">
                    Задач пока нет
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </section>
      <section className="no-print mt-6 rounded-lg bg-[#E2E9DD] p-5">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-0.5 size-5 text-[#42664D]" />
          <div>
            <h2 className="font-extrabold">Памятка</h2>
            <p className="mt-1 text-sm text-[#4E5752]">
              Документы, ключи, зарядки и аптечку перевозите с собой. Хрупкие
              вещи подписывайте и ставьте в коробки вертикально.
            </p>
          </div>
        </div>
      </section>
      {editing && (
        <TaskEditForm
          task={editing}
          onClose={() => setEditing(null)}
          onSave={(values) => {
            updateProject((current) => ({
              ...current,
              tasks: current.tasks.map((item) =>
                item.id === editing.id ? { ...item, ...values } : item,
              ),
            }));
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
