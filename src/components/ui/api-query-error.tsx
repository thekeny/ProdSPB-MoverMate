export function ApiQueryError({ error }: { error: unknown }) {
  if (!error) return null;
  const message =
    error instanceof Error
      ? error.message
      : "Не удалось загрузить данные с сервера.";
  return (
    <p
      role="alert"
      className="mb-4 rounded-md bg-[#F9E8E2] px-4 py-3 text-sm font-medium text-[#8B3C30]"
    >
      {message}
    </p>
  );
}
