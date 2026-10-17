import { DATE_NOON_SUFFIX } from "@/configs/consts/date.const";

export function formatDate(value: string, includeYear = false) {
  const date = new Date(`${value}${DATE_NOON_SUFFIX}`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    ...(includeYear ? { year: "numeric" } : {}),
  }).format(date);
}

export function plural(count: number, forms: [string, string, string]) {
  const rule = new Intl.PluralRules("ru-RU").select(count);
  if (rule === "one") return forms[0];
  if (rule === "few") return forms[1];
  return forms[2];
}

export function formatTaskDue(value: string | null) {
  if (!value) return "Без срока";
  const date = new Date(
    value.length === 10 ? `${value}${DATE_NOON_SUFFIX}` : value,
  );
  if (Number.isNaN(date.getTime())) return "Без срока";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(value.length > 10 ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}
