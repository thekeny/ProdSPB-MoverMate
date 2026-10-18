import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toApiDueAt } from "@/api/project-data";
import { TaskFields } from "@/app/(app)/plan/_components/task-fields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormError } from "@/components/ui/form-error";
import { Modal } from "@/components/ui/modal";
import { PageHeading } from "@/components/ui/page-heading";
import { LIST_PAGE_SIZE } from "@/configs/consts/lists.const";
import type { Project } from "@/configs/types/project.type";
import type { Task, TaskStage } from "@/configs/types/task.type";
import { formatTaskDue } from "@/lib/format";
import {
  createTaskSchema,
  type TaskFormValues,
} from "@/lib/forms/project.schema";
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
      | "title"
      | "description"
      | "stage"
      | "assignees"
      | "dueAt"
      | "reminderOffsetsHours"
    >,
  ) => Promise<boolean>;
}) {
  const dueDate = task.dueAt ? new Date(task.dueAt) : null;
  const defaultDueDate =
    dueDate && !Number.isNaN(dueDate.getTime())
      ? `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")}`
      : "";
  const defaultDueTime =
    dueDate && !Number.isNaN(dueDate.getTime())
      ? `${String(dueDate.getHours()).padStart(2, "0")}:${String(dueDate.getMinutes()).padStart(2, "0")}`
      : "";
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(createTaskSchema(task.dueAt)),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      title: task.title,
      description: task.description,
      stage: task.stage,
      assignees: task.assignees,
      dueDate: defaultDueDate,
      dueTime: defaultDueTime,
      reminderOffsets: (task.reminderOffsetsHours ?? []).map(String),
    },
  });
  return (
    <Modal className="max-w-xl" label="Редактировать задачу" onClose={onClose}>
      <h2 className="text-2xl font-extrabold tracking-[-0.04em]">
        Редактировать задачу
      </h2>
      <form
        onSubmit={handleSubmit(async (values) => {
          const saved = await onSave({
            title: values.title.trim(),
            description: values.description.trim(),
            stage: values.stage as TaskStage,
            assignees: values.assignees,
            dueAt: toApiDueAt(values.dueDate, values.dueTime),
            reminderOffsetsHours: values.dueDate
              ? [...new Set(values.reminderOffsets.map(Number))].sort(
                  (a, b) => a - b,
                )
              : [],
          });
          if (saved) onClose();
        })}
        noValidate
        className="mt-6 grid gap-4"
      >
        <TaskFields
          members={members}
          register={register}
          control={control}
          errors={errors}
          setValue={setValue}
        />
        <FormError errors={errors} />
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function PlanView({
  project,
  canEdit,
  onAdd,
  updateProject,
}: {
  project: Project;
  canEdit: boolean;
  onAdd: () => void;
  updateProject: (apply: (project: Project) => Project) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState<Task | null>(null);
  const [removing, setRemoving] = useState<Task | null>(null);
  const [limits, setLimits] = useState<Partial<Record<TaskStage, number>>>({});
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
          canEdit ? (
            <Button onClick={onAdd} className="h-11">
              <Plus />
              Новая задача
            </Button>
          ) : undefined
        }
      />
      <section className="grid min-w-0 gap-4 lg:grid-cols-3 2xl:gap-5">
        {stages.map((stage) => {
          const tasks = project.tasks.filter(
            (task) => task.stage === stage.key,
          );
          return (
            <div key={stage.key} className="min-w-0 rounded-lg bg-white p-5">
              <div className="flex items-start justify-between gap-3 rounded-md bg-[#F5F3EE] p-4">
                <div>
                  <h2 className="font-extrabold">{stage.title}</h2>
                  <p className="mt-1 text-xs text-[#5C6560]">
                    {stage.description}
                  </p>
                </div>
                <span className="tnum shrink-0 rounded-full bg-[#EDF1E8] px-2.5 py-1 text-xs font-bold text-[#42664D]">
                  {tasks.filter((task) => task.done).length}/{tasks.length}
                </span>
              </div>
              <div className="mt-4 grid gap-2">
                {tasks.length ? (
                  tasks
                    .slice(0, limits[stage.key] ?? LIST_PAGE_SIZE)
                    .map((task) => {
                      const checkboxId = `task-check-${task.id}`;
                      return (
                        <div
                          key={task.id}
                          className="flex min-w-0 gap-2 rounded-md bg-[#F5F3EE] p-3 transition-colors duration-200 hover:bg-[#E2E9DD]"
                        >
                          <Checkbox
                            id={checkboxId}
                            checked={task.done}
                            disabled={!canEdit}
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
                          <div className="min-w-0 flex-1">
                            <label
                              htmlFor={checkboxId}
                              className="block cursor-pointer [overflow-wrap:anywhere]"
                            >
                              <span
                                className={cn(
                                  "block text-xs font-bold",
                                  task.done && "text-[#5C6560] line-through",
                                )}
                              >
                                {task.title}
                              </span>
                              {task.description && (
                                <span className="mt-1 block whitespace-pre-wrap text-xs leading-5 text-[#4E5752]">
                                  <span className="[overflow-wrap:anywhere]">
                                    {task.description}
                                  </span>
                                </span>
                              )}
                              <span className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-[#5C6560]">
                                {task.assignees.length ? (
                                  task.assignees.map((assignee) => (
                                    <span
                                      key={assignee}
                                      className="rounded-md bg-[#EDF1E8] px-2 py-1"
                                    >
                                      <span className="[overflow-wrap:anywhere]">
                                        {assignee}
                                      </span>
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
                            {canEdit && (
                              <div className="mt-1 flex justify-end gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => setEditing(task)}
                                  className="text-[#5C6560] hover:bg-[#E8E2D5] hover:text-[#1D2923]"
                                  aria-label={`Редактировать задачу: ${task.title}`}
                                >
                                  <Pencil className="size-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  onClick={() => setRemoving(task)}
                                  className="grid size-7 place-items-center rounded-md text-[#5C6560] transition-colors hover:bg-[#E8E2D5] hover:text-[#A84D3C]"
                                  aria-label={`Удалить задачу: ${task.title}`}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <p className="py-5 text-center text-xs text-[#5C6560]">
                    Задач пока нет
                  </p>
                )}
              </div>
              {tasks.length > (limits[stage.key] ?? LIST_PAGE_SIZE) && (
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() =>
                    setLimits((current) => ({
                      ...current,
                      [stage.key]:
                        (current[stage.key] ?? LIST_PAGE_SIZE) + LIST_PAGE_SIZE,
                    }))
                  }
                >
                  Ещё задачи
                </Button>
              )}
            </div>
          );
        })}
      </section>
      {editing && canEdit && (
        <TaskEditForm
          task={editing}
          members={project.members}
          onClose={() => setEditing(null)}
          onSave={(values) =>
            updateProject((current) => ({
              ...current,
              tasks: current.tasks.map((item) =>
                item.id === editing.id ? { ...item, ...values } : item,
              ),
            }))
          }
        />
      )}
      {removing && canEdit && (
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
