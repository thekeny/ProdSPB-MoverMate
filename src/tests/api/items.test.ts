import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { client } from "@/api/generated/client.gen";
import { scanItems } from "@/api/items";

describe("scanItems", () => {
  beforeEach(() => client.setConfig({ baseUrl: "http://localhost" }));
  afterEach(() => {
    client.setConfig({ baseUrl: "" });
    vi.unstubAllGlobals();
  });

  it("posts the raw image with its own content type", async () => {
    const sent: { request?: Request; body?: string } = {};
    vi.stubGlobal(
      "fetch",
      vi.fn(async (request: Request) => {
        sent.request = request;
        sent.body = await request.text();
        return Response.json({ items: [{ name: "Чашка", quantity: 2 }] });
      }),
    );
    const image = new Blob(["png"], { type: "image/png" });

    await expect(scanItems("project-1", image)).resolves.toEqual({
      items: [{ name: "Чашка", quantity: 2 }],
    });
    expect(sent.request?.method).toBe("POST");
    expect(new URL(sent.request?.url ?? "").pathname).toBe(
      "/api/v1/projects/project-1/items/scan",
    );
    expect(sent.request?.headers.get("Content-Type")).toBe("image/png");
    expect(sent.body).toBe("png");
  });
});
