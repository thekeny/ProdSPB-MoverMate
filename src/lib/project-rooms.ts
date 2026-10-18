export function getRoomChanges(previous: string[], next: string[]) {
  const nextNames = new Set(next.map((name) => name.toLocaleLowerCase("ru")));
  const previousNames = new Set(
    previous.map((name) => name.toLocaleLowerCase("ru")),
  );

  return {
    added: next.filter(
      (name) => !previousNames.has(name.toLocaleLowerCase("ru")),
    ),
    removed: previous.filter(
      (name) => !nextNames.has(name.toLocaleLowerCase("ru")),
    ),
  };
}
