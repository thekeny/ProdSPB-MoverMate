import { describe, expect, it } from "vitest";
import { pushSupported } from "@/lib/push";

describe("pushSupported", () => {
  it("в тестовом окружении пуши недоступны", () => {
    expect(pushSupported()).toBe(false);
  });
});
