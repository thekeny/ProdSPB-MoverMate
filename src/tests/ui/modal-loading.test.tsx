import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Modal } from "@/components/ui/modal";
import { LoadingScreen } from "@/components/layout/loading-screen";

describe("LoadingScreen", () => {
  it("uses a rotating loader instead of a static square", () => {
    const html = renderToStaticMarkup(<LoadingScreen />);
    expect(html).toContain("animate-spin");
    expect(html).not.toContain("rounded-lg");
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
