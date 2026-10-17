import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { TaskFields } from "@/app/(app)/plan/_components/task-fields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormError } from "@/components/ui/form-error";
import { Modal } from "@/components/ui/modal";
import { PageHeading } from "@/components/ui/page-heading";
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
        <FormError errors={errors} />
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
  updateProject,
}: {
  project: Project;
  onAdd: () => void;
  updateProject: (apply: (project: Project) => Project) => void;
}) {
  const [editing, setEditing] = useState<Task | null>(null);
  const [removing, setRemoving] = useState<Task | null>(null);
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
                        className="flex gap-3 rounded-md bg-[#F5F3EE] p-3 transition-colors duration-200 hover:bg-[#E2E9DD]"
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
                            onClick={() => setRemoving(task)}
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
      {removing && (
        <ConfirmDialog
          title={`Удалить задачу «${removing.title}»?`}
          onClose={() => setRemoving(null)}
          onConfirm={() =>
            updateProject((current) => ({
              ...current,
              tasks: current.tasks.filter((item) => item.id !== removing.id),
            }))
          }
        />
      )}
    </>
  );
}
