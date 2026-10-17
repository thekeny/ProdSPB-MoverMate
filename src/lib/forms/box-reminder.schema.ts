import { z } from "zod";
import { boxReminderDate } from "@/lib/box-reminder";

export const boxReminderSchema = z
  .object({
    preset: z.enum(["hour", "evening", "tomorrow", "custom"]),
    custom: z.string(),
  })
  .superRefine(({ preset, custom }, context) => {
    const date = boxReminderDate(preset, custom);
    if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now())
      context.addIssue({
        code: "custom",
        path: [preset === "custom" ? "custom" : "preset"],
        message: "Выберите время в будущем.",
      });
  });

export type BoxReminderFormValues = z.infer<typeof boxReminderSchema>;
