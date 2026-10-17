export const TASK_REMINDER_PRESETS = [
  { hours: 2, label: "За 2 часа" },
  { hours: 24, label: "За день" },
  { hours: 168, label: "За неделю" },
] as const;

export const BOX_REMINDER_PRESETS = [
  { value: "hour", label: "Через час" },
  { value: "evening", label: "Сегодня вечером" },
  { value: "tomorrow", label: "Завтра утром" },
  { value: "custom", label: "Выбрать дату и время" },
] as const;

export const MAX_TASK_REMINDER_HOURS = 8760;
