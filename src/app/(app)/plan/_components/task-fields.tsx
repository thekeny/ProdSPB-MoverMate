import {
  type Control,
  Controller,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  useWatch,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChipInput } from "@/components/ui/chip-input";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TextInput } from "@/components/ui/text-input";
import { TASK_REMINDER_PRESETS } from "@/configs/consts/reminders.const";
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
  setValue,
}: {
  members: string[];
  control: Control<TaskFormValues>;
  register: UseFormRegister<TaskFormValues>;
  errors: FieldErrors<TaskFormValues>;
  setValue: UseFormSetValue<TaskFormValues>;
}) {
  const dueDate = useWatch({ control, name: "dueDate" });
  const today = getLocalDateInputValue();
  return (
    <>
      <Field label="Задача" error={errors.title?.message}>
        <TextInput
          {...register("title")}
          maxLength={120}
          placeholder="Заказать грузчиков"
        />
      </Field>
      <Field label="Описание">
        <textarea
          {...register("description")}
          maxLength={2000}
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
              <SelectTrigger onBlur={field.onBlur} aria-label="Этап задачи">
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
          {...register("dueDate", {
            onChange: (event) => {
              if (!event.target.value)
                setValue("dueTime", "", { shouldValidate: true });
            },
          })}
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
      <Controller
        control={control}
        name="reminderOffsets"
        render={({ field, fieldState }) => (
          <fieldset className="grid min-w-0 gap-2" disabled={!dueDate}>
            <legend className="mb-2 text-xs font-bold text-[#42664D]">
              Напомнить за, часов
            </legend>
            <div className="flex flex-wrap gap-2">
              {TASK_REMINDER_PRESETS.map(({ hours, label }) => (
                <Button
                  key={hours}
                  type="button"
                  variant="outline"
                  aria-pressed={field.value.includes(String(hours))}
                  onClick={() =>
                    field.onChange(
                      field.value.includes(String(hours))
                        ? field.value.filter((value) => value !== String(hours))
                        : [...field.value, String(hours)],
                    )
                  }
                >
                  {label}
                </Button>
              ))}
            </div>
            <ChipInput
              ariaLabel="Часы до срока задачи для напоминаний"
              value={field.value}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              disabled={!dueDate}
              minLength={1}
              inputMode="numeric"
              placeholder="Число часов и Enter"
              ariaInvalid={fieldState.invalid}
            />
            {fieldState.error && (
              <p role="alert" className="text-xs text-[#A84D3C]">
                {fieldState.error.message}
              </p>
            )}
            <p className="text-xs text-[#5C6560]">
              {dueDate
                ? "Напоминания получат ответственные с включёнными уведомлениями."
                : field.value.length
                  ? "При сохранении без срока напоминания будут удалены."
                  : "Сначала укажите срок задачи."}
            </p>
          </fieldset>
        )}
      />
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
          <p className="text-xs text-[#5C6560]">
            Добавьте участников в настройках проекта.
          </p>
        )}
      </fieldset>
    </>
  );
}
