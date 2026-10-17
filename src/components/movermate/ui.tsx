import { X } from "lucide-react";
import Image from "next/image";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cloneElement, isValidElement, useEffect, useId } from "react";
import QRCode from "react-qr-code";
import { cn } from "@/lib/utils";

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

export function TextInput({
  ref,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  ref?: (element: HTMLInputElement | null) => void;
}) {
  return (
    <input
      ref={ref}
      {...props}
      className={cn(
        "h-11 rounded-[7px] bg-[#EDF1E8] px-3 text-sm text-[#1D2923] outline-none placeholder:text-[#68716C] hover:bg-[#E2E9DD] focus:bg-white focus:ring-3 focus:ring-[#42664D]/30",
        props.className,
      )}
    />
  );
}

export function Modal({
  children,
  onClose,
  className,
  label,
}: {
  children: ReactNode;
  onClose?: () => void;
  className?: string;
  label?: string;
}) {
  const titleId = useId();
  useEffect(() => {
    if (!onClose) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#1D2923]/45 p-4 animate-in fade-in duration-200">
      <button
        type="button"
        aria-label="Закрыть окно"
        tabIndex={-1}
        className="absolute inset-0 cursor-default"
        onClick={() => onClose?.()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={label ? titleId : undefined}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onClose?.();
          }
        }}
        className={cn(
          "relative max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-3xl bg-white p-6 duration-200 ease-out animate-in fade-in zoom-in-95 sm:p-7",
          className,
        )}
      >
        {label && (
          <h2 id={titleId} className="sr-only">
            {label}
          </h2>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 grid size-9 place-items-center rounded-full text-[#68716C] transition-colors hover:bg-[#EDF1E8] hover:text-[#1D2923]"
            aria-label="Закрыть"
          >
            <X className="size-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/logo.png"
        alt="MoverMate"
        width={small ? 34 : 46}
        height={small ? 34 : 46}
        className="rounded-xl object-contain"
        priority
      />
      <div>
        <div
          className={cn(
            "font-extrabold tracking-[-0.04em] text-[#1D2923]",
            small ? "text-base" : "text-xl",
          )}
        >
          MoverMate
        </div>
        {!small && (
          <p className="mt-0.5 text-xs text-[#68716C]">Переезд без хаоса</p>
        )}
      </div>
    </div>
  );
}

export function Qr({ value, size = 96 }: { value: string; size?: number }) {
  return (
    <div
      className="rounded-lg bg-white p-2"
      style={{ width: size + 16, height: size + 16 }}
    >
      <QRCode
        value={value}
        size={size}
        bgColor="#FFFFFF"
        fgColor="#1D2923"
        style={{ width: size, height: size }}
      />
    </div>
  );
}

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
