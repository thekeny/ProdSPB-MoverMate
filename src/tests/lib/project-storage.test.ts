import { describe, expect, it } from "vitest";
import {
  normalizeProjectData,
  parseStoredProjects,
} from "@/lib/project-storage";

describe("normalizeProjectData", () => {
  it("восстанавливает старый проект и отбрасывает повреждённые записи", () => {
    const project = normalizeProjectData({
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

    expect(project.boxes).toHaveLength(1);
    expect(project.boxes[0].room).toBe("Неизвестная комната");
    expect(project.boxes[0].status).toBe("packing");
    expect(project.boxes[0].number).toBe(1);
    expect(project.boxes[0].qrToken).toMatch(/^qr-/);
    expect(project.items[0]).toMatchObject({
      name: "Чашки",
      state: "IN_BOX",
      boxId: "BOX-1",
    });
    expect(project.destinationRooms).toContain("Неизвестная комната");
    expect(project.tasks[0].stage).toBe("BEFORE");
  });

  it("возвращает пустые данные для повреждённой записи", () => {
    expect(normalizeProjectData(null).boxes).toEqual([]);
    expect(normalizeProjectData({}).tasks).toEqual([]);
  });

  it("читает локальные данные по серверному id проекта", () => {
    const saved = JSON.stringify({
      activeId: "server-project-1",
      data: {
        "server-project-1": { tasks: [{ id: "task-1", title: "Ключи" }] },
      },
    });
    const projects = parseStoredProjects(saved);
    expect(projects.activeId).toBe("server-project-1");
    expect(projects.data["server-project-1"].tasks[0].title).toBe("Ключи");
  });

  it("сохраняет локальные данные старого формата до их привязки к серверному id", () => {
    const saved = JSON.stringify({
      activeId: "legacy-project-1",
      projects: [
        {
          id: "legacy-project-1",
          name: "Старый переезд",
          boxes: [{ id: "box-1", title: "Книги" }],
        },
      ],
    });
    const projects = parseStoredProjects(saved);
    expect(projects.data["legacy-project-1"].boxes[0].title).toBe("Книги");
  });
});
