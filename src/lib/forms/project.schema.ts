import { z } from "zod";
import { MAX_TASK_REMINDER_HOURS } from "@/configs/consts/reminders.const";
import {
  getLocalDateInputMaxValue,
  getLocalDateInputValue,
  getLocalTimeInputValue,
} from "@/lib/date-time";

function validDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return (
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
  );
}

function validTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return false;
  return Number(match[1]) < 24 && Number(match[2]) < 60;
}

export const projectCreationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Введите не менее 2 символов.")
    .max(100, "Не более 100 символов."),
  date: z
    .string()
    .min(1, "Выберите дату переезда.")
    .refine(validDate, "Укажите корректную дату.")
    .refine(
      (date) => !date || date >= getLocalDateInputValue(),
      "Дата переезда не может быть в прошлом.",
    )
    .refine(
      (date) => !date || date <= getLocalDateInputMaxValue(),
      "Дата переезда не может быть дальше чем через 10 лет.",
    ),
  from: z.string().max(200, "Не более 200 символов."),
  to: z.string().max(200, "Не более 200 символов."),
  sourceRooms: z.array(z.string().trim().min(2).max(50)),
  destinationRooms: z.array(z.string().trim().min(2).max(50)),
});

export const projectSettingsSchema = projectCreationSchema
  .omit({ sourceRooms: true, destinationRooms: true })
  .extend({
    qrCodeStrategy: z.string(),
    reminderOffsets: z.array(z.string()),
  })
  .superRefine(({ reminderOffsets }, context) => {
    if (
      reminderOffsets.some((days) => !/^\d+$/.test(days) || Number(days) > 365)
    ) {
      context.addIssue({
        code: "custom",
        path: ["reminderOffsets"],
        message: "Укажите целые числа от 0 до 365.",
      });
    }
  });

export function createTaskSchema(previousDueAt?: string | null) {
  return z
    .object({
      title: z
        .string()
        .trim()
        .min(2, "Введите не менее 2 символов.")
        .max(120, "Не более 120 символов."),
      description: z
        .string()
        .max(2000, "Описание должно содержать не более 2000 символов."),
      stage: z.string(),
      assignees: z.array(z.string()),
      dueDate: z
        .string()
        .refine((date) => !date || validDate(date), "Укажите корректную дату."),
      dueTime: z
        .string()
        .refine(
          (time) => !time || validTime(time),
          "Укажите корректное время.",
        ),
      reminderOffsets: z
        .array(z.string())
        .refine(
          (values) =>
            values.every(
              (value) =>
                /^\d+$/.test(value) &&
                Number(value) >= 1 &&
                Number(value) <= MAX_TASK_REMINDER_HOURS,
            ),
          "Укажите целое число часов от 1 до 8760.",
        ),
    })
    .superRefine((values, context) => {
      if (values.dueTime && !values.dueDate) {
        context.addIssue({
          code: "custom",
          path: ["dueDate"],
          message: "Сначала выберите дату.",
        });
        return;
      }
      if (!values.dueDate) return;

      const previous = previousDueAt ? new Date(previousDueAt) : null;
      if (
        previous &&
        Number.isFinite(previous.getTime()) &&
        values.dueDate === getLocalDateInputValue(previous) &&
        values.dueTime === getLocalTimeInputValue(previous)
      )
        return;

      const today = getLocalDateInputValue();
      const isPastDate = values.dueDate < today;
      const isTooFarDate = values.dueDate > getLocalDateInputMaxValue();
      const isPastTime =
        values.dueDate === today &&
        Boolean(values.dueTime) &&
        new Date(`${values.dueDate}T${values.dueTime}:00`).getTime() <=
          Date.now();
      if (isTooFarDate) {
        context.addIssue({
          code: "custom",
          path: ["dueDate"],
          message: "Срок не может быть дальше чем через 10 лет.",
        });
      } else if (isPastDate || isPastTime) {
        context.addIssue({
          code: "custom",
          path: [values.dueTime ? "dueTime" : "dueDate"],
          message: "Нельзя указать срок в прошлом.",
        });
      }
    });
}

export const taskSchema = createTaskSchema();

const itemEntrySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Введите не менее 2 символов.")
    .max(100, "Название должно содержать не более 100 символов."),
  quantity: z
    .number({ error: "Укажите количество." })
    .int("Укажите целое число.")
    .min(1, "Количество должно быть не меньше 1.")
    .max(9999, "Количество должно быть не больше 9999."),
});

export const boxSchema = z.object({
  title: z
    .string()
    .trim()
    .max(100, "Название должно содержать не более 100 символов."),
  room: z.string().min(1, "Выберите комнату."),
  sourceRoom: z.string().min(1, "Выберите исходную комнату."),
  items: z.array(itemEntrySchema),
  fragile: z.boolean(),
});

export const packingItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Введите не менее 2 символов.")
    .max(100, "Название должно содержать не более 100 символов."),
  room: z.string().min(1, "Выберите исходную комнату."),
  priority: z.enum(["NORMAL", "FIRST_NECESSITY"]),
  quantity: z
    .number()
    .int()
    .min(1, "Количество должно быть не меньше 1.")
    .max(9999, "Количество должно быть не больше 9999."),
});

export const itemScanSchema = z.object({
  items: z.array(itemEntrySchema).min(1, "Оставьте хотя бы одну вещь."),
  room: z.string(),
  priority: z.enum(["NORMAL", "FIRST_NECESSITY"]),
});

export const itemScanPlacementSchema = itemScanSchema.extend({
  room: z.string().min(1, "Выберите исходную комнату."),
});

export const roomItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Введите не менее 2 символов.")
    .max(100, "Название должно содержать не более 100 символов."),
  sourceRoom: z.string().min(1, "Выберите исходную комнату."),
});
export const boxEditSchema = boxSchema.pick({
  title: true,
  room: true,
  fragile: true,
});
export const roomNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Введите не менее 2 символов.")
    .max(50, "Название должно содержать не более 50 символов."),
});
export const memberNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Введите не менее 2 символов.")
    .max(50, "Имя должно содержать не более 50 символов."),
});

export type ProjectFormValues = z.infer<typeof projectCreationSchema>;
export type ProjectSettingsFormValues = z.infer<typeof projectSettingsSchema>;
export type TaskFormValues = z.infer<typeof taskSchema>;
export type BoxFormValues = z.infer<typeof boxSchema>;
export type PackingItemFormValues = z.infer<typeof packingItemSchema>;
export type ItemEntry = z.infer<typeof itemEntrySchema>;
export type ItemScanFormValues = z.infer<typeof itemScanSchema>;
