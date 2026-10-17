import type { ItemEntry } from "@/lib/forms/project.schema";

export function mergeItemEntries(current: ItemEntry[], added: ItemEntry[]) {
  const merged = current.map((item) => ({ ...item }));
  for (const item of added) {
    const name = item.name.trim();
    if (!name) continue;
    const existing = merged.find(
      (entry) => entry.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
    );
    if (existing) existing.quantity += item.quantity;
    else merged.push({ name, quantity: item.quantity });
  }
  return merged;
}
