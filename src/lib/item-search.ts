export function matchesWordPrefixes(text: string, query: string) {
  const words = text
    .toLocaleLowerCase("ru")
    .replaceAll("ё", "е")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
  const prefixes = query
    .toLocaleLowerCase("ru")
    .replaceAll("ё", "е")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
  return (
    prefixes.length > 0 &&
    prefixes.every((prefix) => words.some((word) => word.startsWith(prefix)))
  );
}
