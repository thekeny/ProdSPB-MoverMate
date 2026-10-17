import { X } from "lucide-react";
import { type ReactNode, useEffect, useId } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) onClose?.();
    };
    if (onClose) document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      if (onClose) document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#1D2923]/45 p-4 animate-in fade-in duration-200">
      <div
        aria-hidden="true"
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
          "relative max-h-[calc(100vh-2rem)] w-full overscroll-contain overflow-y-auto rounded-xl bg-white p-6 duration-200 ease-out animate-in fade-in zoom-in-95 sm:p-7",
          className,
        )}
      >
        {label && (
          <h2 id={titleId} className="sr-only">
            {label}
          </h2>
        )}
        {onClose && (
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={onClose}
            className="absolute top-5 right-5 rounded-full text-[#68716C] hover:bg-[#EDF1E8] hover:text-[#1D2923]"
            aria-label="Закрыть"
          >
            <X className="size-5" />
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
