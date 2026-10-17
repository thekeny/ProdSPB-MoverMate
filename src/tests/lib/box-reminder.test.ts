import { afterEach, describe, expect, it, vi } from "vitest";
import { boxReminderDate } from "@/lib/box-reminder";
import { boxReminderSchema } from "@/lib/forms/box-reminder.schema";
import { createTaskSchema, taskSchema } from "@/lib/forms/project.schema";

afterEach(() => vi.useRealTimers());

describe("напоминания", () => {
  it("вычисляет час, вечер и следующее утро в местном времени", () => {
    const now = new Date(2026, 9, 18, 12, 30);
    expect(boxReminderDate("hour", "", now).getTime()).toBe(
      now.getTime() + 3_600_000,
    );
    expect(boxReminderDate("evening", "", now).getHours()).toBe(20);
    const tomorrow = boxReminderDate(
      "tomorrow",
      "",
      new Date(2026, 11, 31, 23),
    );
    expect([
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate(),
      tomorrow.getHours(),
    ]).toEqual([2027, 0, 1, 9]);
  });
  it("отклоняет пустую, неверную и прошедшую дату", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 18, 21));
    for (const custom of ["", "broken", "2026-10-17T12:00"])
      expect(
        boxReminderSchema.safeParse({ preset: "custom", custom }).success,
      ).toBe(false);
    expect(
      boxReminderSchema.safeParse({ preset: "evening", custom: "" }).success,
    ).toBe(false);
    expect(
      boxReminderSchema.safeParse({ preset: "tomorrow", custom: "" }).success,
    ).toBe(true);
  });
  it("принимает повторные напоминания задач только в диапазоне API", () => {
    const task = {
      title: "Грузчики",
      description: "",
      stage: "BEFORE",
      assignees: [],
      dueDate: "",
      dueTime: "",
    };
    expect(
      taskSchema.safeParse({ ...task, reminderOffsets: ["2", "24", "168"] })
        .success,
    ).toBe(true);
    for (const value of ["0", "-1", "1.5", "8761", "abc"])
      expect(
        taskSchema.safeParse({ ...task, reminderOffsets: [value] }).success,
      ).toBe(false);
  });
  it("разрешает изменить просроченную задачу без переноса исходного срока", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 18, 21));
    const due = new Date(2026, 9, 17, 12);
    const values = {
      title: "Грузчики",
      description: "Новый текст",
      stage: "BEFORE",
      assignees: [],
      dueDate: "2026-10-17",
      dueTime: "12:00",
      reminderOffsets: ["2"],
    };
    expect(createTaskSchema(due.toISOString()).safeParse(values).success).toBe(
      true,
    );
    expect(
      createTaskSchema(due.toISOString()).safeParse({
        ...values,
        dueTime: "11:00",
      }).success,
    ).toBe(false);
    expect(taskSchema.safeParse(values).success).toBe(false);
  });
});
