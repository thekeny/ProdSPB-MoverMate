import { describe, expect, it } from "vitest";
import { getRoomChanges } from "@/lib/project-rooms";

describe("getRoomChanges", () => {
  it("detects a newly added room against the pre-update list", () => {
    expect(getRoomChanges(["Кухня"], ["Кухня", "Кабинет"])).toEqual({
      added: ["Кабинет"],
      removed: [],
    });
  });

  it("matches names without regard to case and returns removed names", () => {
    expect(getRoomChanges(["Кухня", "Балкон"], ["кухня", "Кабинет"])).toEqual({
      added: ["Кабинет"],
      removed: ["Балкон"],
    });
  });
});
