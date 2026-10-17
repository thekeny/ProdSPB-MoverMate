import {
  Archive,
  Bath,
  BedDouble,
  CookingPot,
  House,
  Laptop,
  type LucideIcon,
} from "lucide-react";

export const ROOM_PRESETS = [
  "Кухня",
  "Гостиная",
  "Спальня",
  "Кабинет",
  "Ванная",
] as const;

export function roomIcon(name: string): LucideIcon {
  const value = name.toLocaleLowerCase("ru");
  if (value.includes("кух")) return CookingPot;
  if (value.includes("спаль") || value.includes("детск")) return BedDouble;
  if (value.includes("ван") || value.includes("сануз")) return Bath;
  if (value.includes("кабин") || value.includes("рабоч")) return Laptop;
  if (value.includes("клад") || value.includes("гардероб")) return Archive;
  return House;
}
