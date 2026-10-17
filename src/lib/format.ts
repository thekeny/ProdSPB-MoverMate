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
