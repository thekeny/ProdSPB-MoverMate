import { describe, expect, it } from "vitest";
import { formatDate, plural } from "@/lib/format";
import { uid } from "@/lib/id";
import { createEmptyProject } from "@/lib/project";

describe("formatDate", () => {
  it("форматирует валидную дату", () => {
    expect(formatDate("2026-11-01")).toMatch(/ноября/);
  });

  it("возвращает заглушку для пустой даты", () => {
    expect(formatDate("")).toBe("—");
  });

  it("возвращает заглушку для невалидной даты", () => {
    expect(formatDate("не дата")).toBe("—");
  });
});

describe("plural", () => {
  it("склоняет по правилам русского языка", () => {
    const forms: [string, string, string] = ["коробка", "коробки", "коробок"];
    expect(plural(1, forms)).toBe("коробка");
    expect(plural(2, forms)).toBe("коробки");
    expect(plural(5, forms)).toBe("коробок");
    expect(plural(21, forms)).toBe("коробка");
    expect(plural(11, forms)).toBe("коробок");
  });
});

describe("uid", () => {
  it("генерирует уникальные id", () => {
    const ids = new Set(Array.from({ length: 200 }, () => uid("box")));
    expect(ids.size).toBe(200);
  });
});

describe("createEmptyProject", () => {
  it("создаёт проект с корректной структурой", () => {
    const project = createEmptyProject({
      name: "Тест",
      date: "2026-12-01",
      from: "",
      to: "",
    });
    expect(project.qrCodeStrategy).toBe("protected");
    expect(project.boxes).toEqual([]);
    expect(project.firstDay.length).toBeGreaterThan(0);
    expect(Object.keys(project.roomsLoaded).length).toBe(4);
  });
});
