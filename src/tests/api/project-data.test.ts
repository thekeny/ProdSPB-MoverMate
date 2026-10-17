import { beforeEach, describe, expect, it, vi } from "vitest";
import { getProjectData } from "@/api/project-data";

const api = vi.hoisted(() => ({
  listRooms: vi.fn(),
  listItems: vi.fn(),
  listTasks: vi.fn(),
  getLoadingChecklist: vi.fn(),
  listBoxes: vi.fn(),
}));
vi.mock("@/api/generated", () => api);
const ok = (data: unknown) =>
  Promise.resolve({ data, response: new Response(null, { status: 200 }) });

beforeEach(() => {
  vi.resetAllMocks();
  api.listRooms.mockImplementation(() =>
    ok([
      { id: "source", name: "Кухня", kind: "SOURCE" },
      { id: "destination", name: "Гостиная", kind: "DESTINATION" },
    ]),
  );
  api.getLoadingChecklist.mockImplementation(() => ok([]));
  api.listTasks.mockImplementation(() =>
    ok([
      {
        id: "task",
        title: "Грузчики",
        description: null,
        phase: "BEFORE",
        assignees: [],
        due_at: "2026-11-01T12:00:00Z",
        is_done: false,
        reminder_offsets_hours: [2, 24],
      },
    ]),
  );
});

describe("данные проекта", () => {
  it("вычитывает все страницы без потерь и сохраняет напоминания", async () => {
    const item = (id: string) => ({
      id,
      name: id,
      state: "IN_BOX",
      source_room: { name: "Кухня" },
      box: { id: "box" },
      quantity: 2,
      priority: "FIRST_NECESSITY",
    });
    api.listItems.mockImplementation(({ query }) =>
      ok({
        results: [item(query.after ? "вторая" : "первая")],
        next_cursor: query.after ? null : "next-items",
      }),
    );
    const box = (id: string, number: number) => ({
      id,
      number,
      title: null,
      destination_room: { name: "Гостиная" },
      qr_token: id,
      is_fragile: false,
      status: "PACKING",
      contents_reminder_at: "2026-11-01T10:00:00Z",
      created_by: { id: "owner" },
    });
    api.listBoxes.mockImplementation(({ query }) =>
      ok({
        results: [box(query.after ? "box2" : "box", query.after ? 2 : 1)],
        next_cursor: query.after ? null : "next-boxes",
      }),
    );
    const project = await getProjectData("project");
    expect(project.items.map((entry) => entry.name)).toEqual([
      "первая",
      "вторая",
    ]);
    expect(project.boxes.map((entry) => entry.number)).toEqual([2, 1]);
    expect(project.boxes[1]).toMatchObject({
      sourceRooms: ["Кухня"],
      createdById: "owner",
      contentsReminderAt: "2026-11-01T10:00:00Z",
    });
    expect(project.tasks[0].reminderOffsetsHours).toEqual([2, 24]);
    expect(api.listItems).toHaveBeenLastCalledWith(
      expect.objectContaining({ query: { limit: 100, after: "next-items" } }),
    );
    expect(api.listBoxes).toHaveBeenCalledTimes(2);
  });
  it("не подменяет ошибку загрузки пустым проектом", async () => {
    api.listItems.mockImplementation(() =>
      ok({ results: [], next_cursor: null }),
    );
    api.listBoxes.mockResolvedValue({
      response: new Response(null, { status: 500 }),
      error: { error: { code: "unavailable", message: "Недоступно" } },
    });
    await expect(getProjectData("project")).rejects.toThrow("Недоступно");
  });
});
