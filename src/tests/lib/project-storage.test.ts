import { describe, expect, it } from "vitest";
import { normalizeProject } from "@/lib/project-storage";

describe("normalizeProject", () => {
  it("восстанавливает старый проект и отбрасывает повреждённые записи", () => {
    const project = normalizeProject({
      id: "project-1",
      name: "Переезд",
      date: "2026-12-01",
      boxes: [
        {
          id: "BOX-1",
          title: "Кухня",
          room: "Неизвестная комната",
          status: "broken",
          items: [{ id: "item-1", name: "Чашки" }, { nope: true }],
        },
        { nope: true },
      ],
      tasks: [{ id: "task-1", title: "Ключи", stage: "invalid" }],
      roomsLoaded: { Кухня: true },
    });

    expect(project).not.toBeNull();
    expect(project?.boxes).toHaveLength(1);
    expect(project?.boxes[0].room).toBe("Кухня");
    expect(project?.boxes[0].status).toBe("packing");
    expect(project?.boxes[0].salt).toMatch(/^salt-/);
    expect(project?.roomsLoaded).toEqual({
      Кухня: true,
      Кабинет: false,
      Спальня: false,
      Гостиная: false,
    });
    expect(project?.tasks[0].stage).toBe("before");
  });

  it("отклоняет запись без обязательных полей", () => {
    expect(normalizeProject(null)).toBeNull();
    expect(normalizeProject({ id: "project-1" })).toBeNull();
  });
});
