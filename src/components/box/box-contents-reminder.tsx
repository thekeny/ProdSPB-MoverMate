"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import {
  cancelBoxContentsReminder,
  setBoxContentsReminder,
} from "@/api/generated";
import { unwrap } from "@/api/request";
import { ApiQueryError } from "@/components/ui/api-query-error";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TextInput } from "@/components/ui/text-input";
import { QUERY_KEYS } from "@/configs/consts/api.const";
import { BOX_REMINDER_PRESETS } from "@/configs/consts/reminders.const";
import type { MoveBox } from "@/configs/types/box.type";
import { boxReminderDate } from "@/lib/box-reminder";
import {
  type BoxReminderFormValues,
  boxReminderSchema,
} from "@/lib/forms/box-reminder.schema";
import { useAuth } from "@/providers/auth-provider";

export function BoxContentsReminder({
  box,
  projectId,
  canEdit,
}: {
  box: MoveBox;
  projectId: string;
  canEdit: boolean;
}) {
  const { account } = useAuth();
  const client = useQueryClient();
  const form = useForm<BoxReminderFormValues>({
    resolver: zodResolver(boxReminderSchema),
    mode: "onBlur",
    defaultValues: { preset: "hour", custom: "" },
  });
  const preset = form.watch("preset");
  const mutation = useMutation({
    mutationFn: async (values: BoxReminderFormValues | null) => {
      if (!values)
        await unwrap(cancelBoxContentsReminder({ path: { box_id: box.id } }));
      else {
        const date = boxReminderDate(values.preset, values.custom);
        if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now())
          throw new Error("Выберите время в будущем.");
        await unwrap(
          setBoxContentsReminder({
            path: { box_id: box.id },
            body: { remind_at: date.toISOString() },
          }),
        );
      }
    },
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: QUERY_KEYS.PROJECT_DATA(projectId),
      });
    },
  });
  if (box.createdById !== account?.id || box.status !== "packing") return null;
  return (
    <section className="mt-5 grid gap-3 rounded-[10px] bg-[#EDF1E8] p-4">
      <h3 className="text-sm font-bold">Напомнить заполнить коробку</h3>
      {box.contentsReminderAt && (
        <output className="text-sm">
          Запланировано на{" "}
          {new Date(box.contentsReminderAt).toLocaleString("ru")}
        </output>
      )}
      <p className="text-xs text-[#68716C]">
        Напоминание придёт вам, если уведомления включены. При сборке коробки
        оно отменится.
      </p>
      {canEdit && (
        <form
          className="grid gap-3"
          noValidate
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <Field
            label="Когда напомнить"
            error={form.formState.errors.preset?.message}
          >
            <Controller
              control={form.control}
              name="preset"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  items={[...BOX_REMINDER_PRESETS]}
                >
                  <SelectTrigger
                    aria-label="Когда напомнить"
                    disabled={mutation.isPending}
                    onBlur={field.onBlur}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOX_REMINDER_PRESETS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        disabled={
                          option.value === "evening" &&
                          new Date().getHours() >= 20
                        }
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          {preset === "custom" && (
            <Field
              label="Дата и время напоминания"
              error={form.formState.errors.custom?.message}
            >
              <TextInput
                type="datetime-local"
                {...form.register("custom")}
                disabled={mutation.isPending}
              />
            </Field>
          )}
          <ApiQueryError error={mutation.error} />
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              loading={mutation.isPending}
              disabled={mutation.isPending}
            >
              {box.contentsReminderAt ? "Перенести напоминание" : "Напомнить"}
            </Button>
            {box.contentsReminderAt && (
              <Button
                type="button"
                variant="ghost"
                disabled={mutation.isPending}
                onClick={() => {
                  form.clearErrors();
                  mutation.mutate(null);
                }}
              >
                Отменить напоминание
              </Button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
