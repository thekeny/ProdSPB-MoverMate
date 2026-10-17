import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import BoxesPage from "@/app/(app)/boxes/page";
import type { Project } from "@/configs/types/project.type";
import { createProjectLocalData } from "@/lib/project";

const mocks = vi.hoisted(() => ({
  project: null as Project | null,
  replace: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/providers/projects-provider", () => ({
  useProjects: () => ({
    project: mocks.project,
    canEdit: false,
    addBox: vi.fn(),
    updateProject: vi.fn(),
    changeBoxStatus: vi.fn(),
  }),
}));

it("открывает инвентарь и сохраняет поле поиска между рендерами", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mocks.project = {
    ...createProjectLocalData(),
    id: "project",
    name: "Переезд",
    rooms: [],
    ownerId: "owner",
    isOwner: true,
    date: "2027-01-01",
    from: "",
    to: "",
    qrCodeStrategy: "protected",
    timeZone: "UTC",
    reminderOffsetsDays: [],
    collaborators: [],
    members: [],
  };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  try {
    await act(async () =>
      root.render(
        <QueryClientProvider client={client}>
          <BoxesPage />
        </QueryClientProvider>,
      ),
    );
    expect(container.textContent).toContain("Коробки и вещи");
    const input = container.querySelector('input[aria-label="Поиск вещи"]');
    expect(input).not.toBeNull();
    await act(async () =>
      root.render(
        <QueryClientProvider client={client}>
          <BoxesPage />
        </QueryClientProvider>,
      ),
    );
    expect(container.querySelector('input[aria-label="Поиск вещи"]')).toBe(
      input,
    );
  } finally {
    await act(async () => root.unmount());
    client.clear();
    container.remove();
    vi.unstubAllGlobals();
  }
});
