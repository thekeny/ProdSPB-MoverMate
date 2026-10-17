import { z } from "zod";
import {
  getLocalDateInputMaxValue,
  getLocalDateInputValue,
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
  name: z.string().trim().min(1, "Введите название проекта."),
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
  from: z.string(),
  to: z.string(),
  sourceRooms: z.array(z.string()),
  destinationRooms: z.array(z.string()),
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

export const taskSchema = z
  .object({
    title: z.string().trim().min(1, "Введите название задачи."),
    description: z.string(),
    stage: z.string(),
    assignees: z.array(z.string()),
    dueDate: z
      .string()
      .refine((date) => !date || validDate(date), "Укажите корректную дату."),
    dueTime: z
      .string()
      .refine((time) => !time || validTime(time), "Укажите корректное время."),
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

const itemEntrySchema = z.object({
  name: z.string().trim().min(1, "Введите название вещи."),
  quantity: z
    .number({ error: "Укажите количество." })
    .int("Укажите целое число.")
    .min(1, "Количество должно быть не меньше 1."),
});

export const boxSchema = z.object({
  title: z.string().trim().min(1, "Введите описание коробки."),
  room: z.string().min(1, "Выберите комнату."),
  sourceRoom: z.string().min(1, "Выберите исходную комнату."),
  items: z.array(itemEntrySchema),
  fragile: z.boolean(),
});

export const packingItemSchema = z.object({
  name: z.string().trim().min(1, "Введите название вещи."),
  room: z.string().min(1, "Выберите исходную комнату."),
  priority: z.enum(["NORMAL", "FIRST_NECESSITY"]),
  quantity: z.number().int().min(1, "Количество должно быть не меньше 1."),
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
  name: z.string().trim().min(1, "Введите название вещи."),
  sourceRoom: z.string().min(1, "Выберите исходную комнату."),
});
export const boxEditSchema = boxSchema.pick({
  title: true,
  room: true,
  fragile: true,
});
export const roomNameSchema = z.object({
  name: z.string().trim().min(1, "Введите название комнаты."),
});
export const memberNameSchema = z.object({
  name: z.string().trim().min(1, "Введите имя участника."),
});

export type ProjectFormValues = z.infer<typeof projectCreationSchema>;
export type ProjectSettingsFormValues = z.infer<typeof projectSettingsSchema>;
export type TaskFormValues = z.infer<typeof taskSchema>;
export type BoxFormValues = z.infer<typeof boxSchema>;
export type PackingItemFormValues = z.infer<typeof packingItemSchema>;
export type ItemEntry = z.infer<typeof itemEntrySchema>;
export type ItemScanFormValues = z.infer<typeof itemScanSchema>;
