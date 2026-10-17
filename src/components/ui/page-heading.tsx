import type { ReactNode } from "react";

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="no-print mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-extrabold tracking-[0.1em] text-[#42664D] uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-2 max-w-3xl text-4xl font-extrabold tracking-[-0.06em] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#68716C]">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
