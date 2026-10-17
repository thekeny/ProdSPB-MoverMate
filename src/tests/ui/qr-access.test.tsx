import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TokenBoxPage from "@/app/b/[token]/page";
import type { Account } from "@/configs/types/account.type";

const mocks = vi.hoisted(() => ({
  getBoxByQr: vi.fn(),
  replace: vi.fn(),
  push: vi.fn(),
  account: null as Account | null,
}));
vi.mock("@/api/generated", () => ({ getBoxByQr: mocks.getBoxByQr }));
vi.mock("next/navigation", () => ({
  useParams: () => ({ token: "test-token" }),
  useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
}));
vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ account: mocks.account, ready: true }),
}));
vi.mock("@/providers/projects-provider", () => ({
  useProjects: () => ({ projects: [], ready: true, setActiveId: vi.fn() }),
}));

let root: Root;
let container: HTMLDivElement;
let client: QueryClient;
const card = {
  access: "READ",
  project: { id: "project", name: "Переезд" },
  box: {
    id: "box",
    number: 12,
    title: "Посуда",
    destination_room: { name: "Кухня" },
    status: "PACKING",
    items: [{ id: "item", name: "Чайник", quantity: 1 }],
  },
};
const render = async () => {
  await act(async () => {
    root.render(
      <QueryClientProvider client={client}>
        <TokenBoxPage />
      </QueryClientProvider>,
    );
  });
};
const until = async (assertion: () => void) => {
  await vi.waitFor(async () => {
    await act(async () => {
      await Promise.resolve();
    });
    assertion();
  });
};

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.clearAllMocks();
  mocks.account = null;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  client.clear();
  container.remove();
  vi.unstubAllGlobals();
});

describe("доступ по QR", () => {
  it("показывает OPEN-карточку без аккаунта и не отправляет на вход", async () => {
    mocks.getBoxByQr.mockResolvedValue({
      data: card,
      response: new Response(null, { status: 200 }),
    });
    await render();
    await until(() => expect(container.textContent).toContain("Чайник"));
    expect(mocks.getBoxByQr).toHaveBeenCalledWith({
      path: { qr_token: "test-token" },
    });
    expect(container.textContent).toContain("Только просмотр");
    expect(mocks.replace).not.toHaveBeenCalled();
  });
  it("после 401 сохраняет QR-ссылку для возврата из входа", async () => {
    mocks.getBoxByQr.mockResolvedValue({
      response: new Response(null, { status: 401 }),
      error: { error: { code: "unauthorized", message: "Войдите" } },
    });
    await render();
    await until(() =>
      expect(mocks.replace).toHaveBeenCalledWith(
        "/login?next=%2Fb%2Ftest-token",
      ),
    );
  });
  it("после ошибки сервера предлагает повторить без редиректа на вход", async () => {
    mocks.getBoxByQr.mockResolvedValue({
      response: new Response(null, { status: 500 }),
      error: { error: { code: "unavailable", message: "Недоступно" } },
    });
    await render();
    await until(() =>
      expect(container.textContent).toContain("Не удалось загрузить коробку"),
    );
    mocks.getBoxByQr.mockResolvedValue({
      data: card,
      response: new Response(null, { status: 200 }),
    });
    const retry = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "Повторить",
    );
    await act(async () => retry?.click());
    await until(() => expect(container.textContent).toContain("Чайник"));
    expect(mocks.replace).not.toHaveBeenCalled();
  });
  it("повторно проверяет права после смены аккаунта", async () => {
    mocks.getBoxByQr.mockResolvedValue({
      data: card,
      response: new Response(null, { status: 200 }),
    });
    await render();
    await until(() =>
      expect(container.textContent).toContain("Только просмотр"),
    );
    mocks.account = { id: "owner", username: "owner" };
    mocks.getBoxByQr.mockResolvedValue({
      data: { ...card, access: "WRITE" },
      response: new Response(null, { status: 200 }),
    });
    await render();
    await until(() =>
      expect(container.textContent).toContain("Открыть в проекте"),
    );
    expect(mocks.getBoxByQr).toHaveBeenCalledTimes(2);
  });
});
