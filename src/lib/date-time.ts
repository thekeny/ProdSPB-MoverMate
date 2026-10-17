export function getLocalDateInputValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function getLocalDateInputMaxValue(date = new Date()) {
  const year = date.getFullYear() + 10;
  const month = date.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const day = Math.min(date.getDate(), lastDay);
  const maxDate = new Date(year, month, day);
  const offset = maxDate.getTimezoneOffset() * 60_000;
  return new Date(maxDate.getTime() - offset).toISOString().slice(0, 10);
}

export function getLocalTimeInputValue(date = new Date()) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
