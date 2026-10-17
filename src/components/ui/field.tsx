import { cloneElement, isValidElement, type ReactNode, useId } from "react";

export function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: ReactNode;
  error?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-xs font-bold text-[#42664D]">
        {label}
      </label>
      {isValidElement(children)
        ? cloneElement(
            children as React.ReactElement<{
              id?: string;
              "aria-invalid"?: boolean;
              "aria-describedby"?: string;
            }>,
            {
              id,
              "aria-invalid": error ? true : undefined,
              "aria-describedby": error ? errorId : undefined,
            },
          )
        : children}
      {error && (
        <p id={errorId} className="text-xs text-[#A84D3C]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
