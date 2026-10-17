import { cloneElement, isValidElement, type ReactNode, useId } from "react";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-xs font-bold text-[#42664D]">
        {label}
      </label>
      {isValidElement(children)
        ? cloneElement(children as React.ReactElement<{ id?: string }>, { id })
        : children}
    </div>
  );
}
