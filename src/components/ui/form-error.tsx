import type { FieldErrors, FieldValues } from "react-hook-form";

function messages(errors: FieldErrors): string[] {
  return Object.values(errors).flatMap((error) => {
    if (!error || typeof error !== "object") return [];
    if ("message" in error && typeof error.message === "string")
      return [error.message];
    return messages(error as FieldErrors);
  });
}

export function FormError({
  errors,
  message,
}: {
  errors?: FieldErrors<FieldValues>;
  message?: string | null;
}) {
  const fieldMessages = errors ? [...new Set(messages(errors))] : [];
  if (!fieldMessages.length && !message) return null;
  return (
    <div
      role="alert"
      className="rounded-md bg-[#F9E8E2] p-3 text-sm text-[#A84D3C]"
    >
      {message && <p className="font-bold">{message}</p>}
      {fieldMessages.length > 0 && (
        <ul className={message ? "mt-1 grid gap-1" : "grid gap-1"}>
          {fieldMessages.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
