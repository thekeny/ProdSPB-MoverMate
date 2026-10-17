import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TextInput } from "@/components/ui/text-input";
import { TASK_STAGE_OPTIONS } from "@/configs/consts/task-stages.const";
import type { Task } from "@/configs/types/task.type";

export function TaskFields({
  task,
  members,
}: {
  task?: Task;
  members: string[];
}) {
  return (
    <>
      <Field label="Задача">
        <TextInput
          name="title"
          required
          defaultValue={task?.title}
          placeholder="Заказать грузчиков"
        />
      </Field>
      <Field label="Описание">
        <textarea
          name="description"
          defaultValue={task?.description}
          rows={3}
          className="w-full rounded-[7px] bg-[#EDF1E8] p-3 text-sm outline-none focus:ring-3 focus:ring-[#42664D]/30"
        />
      </Field>
      <Field label="Этап">
        <Select
          name="stage"
          defaultValue={task?.stage ?? TASK_STAGE_OPTIONS[0].value}
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
      <Field label="Дата">
        <TextInput
          name="dueDate"
          type="date"
          defaultValue={task?.dueAt?.slice(0, 10)}
        />
      </Field>
      <Field label="Время (необязательно)">
        <TextInput
          name="dueTime"
          type="time"
          defaultValue={task?.dueAt?.slice(11, 16)}
        />
      </Field>
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-xs font-bold">Ответственные</legend>
        {members.length ? (
          members.map((member) => (
            <div key={member} className="flex items-center gap-2 text-sm">
              <Checkbox
                aria-label={`Назначить ${member}`}
                name="assignees"
                value={member}
                defaultChecked={task?.assignees.includes(member)}
              />
              {member}
            </div>
          ))
        ) : (
          <p className="text-xs text-[#68716C]">
            Добавьте участников в настройках проекта.
          </p>
        )}
      </fieldset>
    </>
  );
}
