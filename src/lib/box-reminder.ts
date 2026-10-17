export function boxReminderDate(
  preset: string,
  custom: string,
  now = new Date(),
) {
  if (preset === "custom") return new Date(custom);
  if (preset === "hour") return new Date(now.getTime() + 60 * 60_000);
  const date = new Date(now);
  if (preset === "tomorrow") {
    date.setDate(date.getDate() + 1);
    date.setHours(9, 0, 0, 0);
  } else date.setHours(20, 0, 0, 0);
  return date;
}
