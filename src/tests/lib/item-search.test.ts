import { describe, expect, it } from "vitest";
import { matchesWordPrefixes } from "@/lib/item-search";

describe("поиск без сети", () => {
  it("находит начало любого слова, но не подстроку внутри слова", () => {
    expect(matchesWordPrefixes("Белая зарядка USB", "зар")).toBe(true);
    expect(matchesWordPrefixes("Белая зарядка USB", "ряд")).toBe(false);
    expect(matchesWordPrefixes("Белая зарядка USB", "зар бел")).toBe(true);
    expect(matchesWordPrefixes("Белая зарядка USB", "зар чёр")).toBe(false);
  });
  it("учитывает регистр, ё и разделители", () => {
    expect(matchesWordPrefixes("Зубные щётки", "ЩЕТ")).toBe(true);
    expect(matchesWordPrefixes("USB-зарядка", "зар")).toBe(true);
    expect(matchesWordPrefixes("Зарядка", " ")).toBe(false);
  });
});
