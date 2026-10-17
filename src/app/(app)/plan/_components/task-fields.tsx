import {
  type Control,
  Controller,
  type FieldErrors,
  type UseFormRegister,
  useWatch,
} from "react-hook-form";
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
import {
  getLocalDateInputMaxValue,
  getLocalDateInputValue,
  getLocalTimeInputValue,
} from "@/lib/date-time";
import type { TaskFormValues } from "@/lib/forms/project.schema";

export function TaskFields({
  members,
  control,
  register,
  errors,
}: {
  members: string[];
  control: Control<TaskFormValues>;
  register: UseFormRegister<TaskFormValues>;
  errors: FieldErrors<TaskFormValues>;
}) {
  const dueDate = useWatch({ control, name: "dueDate" });
  const today = getLocalDateInputValue();
  return (
    <>
      <Field label="Задача" error={errors.title?.message}>
        <TextInput {...register("title")} placeholder="Заказать грузчиков" />
      </Field>
      <Field label="Описание">
        <textarea
          {...register("description")}
          rows={3}
          className="w-full rounded-[7px] bg-[#EDF1E8] p-3 text-sm outline-none focus:ring-3 focus:ring-[#42664D]/30"
        />
      </Field>
      <Field label="Этап">
        <Controller
          control={control}
          name="stage"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              items={TASK_STAGE_OPTIONS}
            >
              <SelectTrigger onBlur={field.onBlur}>
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
          )}
        />
      </Field>
      <Field label="Дата" error={errors.dueDate?.message}>
        <TextInput
          {...register("dueDate")}
          type="date"
          min={today}
          max={getLocalDateInputMaxValue()}
        />
      </Field>
      <Field label="Время (необязательно)" error={errors.dueTime?.message}>
        <TextInput
          {...register("dueTime")}
          type="time"
          min={dueDate === today ? getLocalTimeInputValue() : undefined}
        />
      </Field>
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-xs font-bold">Ответственные</legend>
        {members.length ? (
          members.map((member) => (
            <div key={member} className="flex items-center gap-2 text-sm">
              <Controller
                control={control}
                name="assignees"
                render={({ field }) => (
                  <Checkbox
                    aria-label={`Назначить ${member}`}
                    checked={field.value.includes(member)}
                    onBlur={field.onBlur}
                    onCheckedChange={(checked) =>
                      field.onChange(
                        checked
                          ? [...field.value, member]
                          : field.value.filter((value) => value !== member),
                      )
                    }
                  />
                )}
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
