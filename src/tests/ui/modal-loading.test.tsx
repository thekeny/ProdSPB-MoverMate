import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { Modal } from "@/components/ui/modal";

describe("LoadingScreen", () => {
  it("показывает состояние загрузки", () => {
    const html = renderToStaticMarkup(<LoadingScreen />);
    expect(html).toContain("Загрузка…");
  });
});

describe("Modal", () => {
  it("supports flexible width for different content sizes", () => {
    const html = renderToStaticMarkup(
      <Modal label="Test" className="max-w-2xl" onClose={() => {}}>
        Content
      </Modal>,
    );
    expect(html).toContain("w-full");
    expect(html).toContain("max-w-2xl");
    expect(html).toContain("min-w-0");
    expect(html).toContain("max-h-[calc(100vh-2rem)]");
  });
});
