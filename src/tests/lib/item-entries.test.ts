import { describe, expect, it } from "vitest";
import { mergeItemEntries } from "@/lib/item-entries";

describe("mergeItemEntries", () => {
  it("adds new items and sums quantities of the same name", () => {
    const current = [{ name: "Чашка", quantity: 1 }];
    expect(
      mergeItemEntries(current, [
        { name: " чашка ", quantity: 2 },
        { name: "Тарелка", quantity: 3 },
        { name: " ", quantity: 1 },
      ]),
    ).toEqual([
      { name: "Чашка", quantity: 3 },
      { name: "Тарелка", quantity: 3 },
    ]);
    expect(current).toEqual([{ name: "Чашка", quantity: 1 }]);
  });
});
