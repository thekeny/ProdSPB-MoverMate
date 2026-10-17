import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { TaskFields } from "@/app/(app)/plan/_components/task-fields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Modal } from "@/components/ui/modal";
import { PageHeading } from "@/components/ui/page-heading";
import { MOVING_TIPS } from "@/configs/consts/moving-tips.const";
import type { Project } from "@/configs/types/project.type";
import type { Task, TaskStage } from "@/configs/types/task.type";
import { formatTaskDue } from "@/lib/format";
import { type TaskFormValues, taskSchema } from "@/lib/forms/project.schema";
import { cn } from "@/lib/utils";

function TaskEditForm({
  task,
  members,
  onClose,
  onSave,
}: {
  task: Task;
  members: string[];
  onClose: () => void;
  onSave: (
    values: Pick<
      Task,
      "title" | "description" | "stage" | "assignees" | "dueAt"
    >,
  ) => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      title: task.title,
      description: task.description,
      stage: task.stage,
      assignees: task.assignees,
      dueDate: task.dueAt?.slice(0, 10) ?? "",
      dueTime: task.dueAt?.slice(11, 16) ?? "",
    },
  });
  return (
    <Modal className="max-w-xl" label="Редактировать задачу" onClose={onClose}>
      <h2 className="text-2xl font-extrabold tracking-[-0.04em]">
        Редактировать задачу
      </h2>
      <form
        onSubmit={handleSubmit((values) =>
          onSave({
            title: values.title.trim(),
            description: values.description.trim(),
            stage: values.stage as TaskStage,
            assignees: values.assignees,
            dueAt: values.dueDate
              ? `${values.dueDate}${values.dueTime ? `T${values.dueTime}` : ""}`
              : null,
          }),
        )}
        noValidate
        className="mt-6 grid gap-4"
      >
        <TaskFields
          members={members}
          register={register}
          control={control}
          errors={errors}
        />
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
      key: "BEFORE",
      title: "До переезда",
      description: "Подготовка дома и маршрута",
    },
    {
      key: "DURING",
      title: "День переезда",
      description: "Погрузка и передача ключей",
    },
    {
      key: "AFTER",
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
                          {task.description && (
                            <span className="mt-1 block whitespace-pre-wrap text-xs leading-5 text-[#4E5752]">
                              {task.description}
                            </span>
                          )}
                          <span className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-[#68716C]">
                            {task.assignees.length ? (
                              task.assignees.map((assignee) => (
                                <span
                                  key={assignee}
                                  className="rounded-md bg-[#EDF1E8] px-2 py-1"
                                >
                                  {assignee}
                                </span>
                              ))
                            ) : (
                              <span>Без ответственного</span>
                            )}
                            <span className="ml-1">
                              {formatTaskDue(task.dueAt)}
                            </span>
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
            <ul className="mt-2 grid gap-1 text-sm text-[#4E5752]">
              {MOVING_TIPS.map((tip) => (
                <li key={tip}>• {tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      {editing && (
        <TaskEditForm
          task={editing}
          members={project.members}
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
