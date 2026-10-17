import { X } from "lucide-react";
import { type ClipboardEvent, type KeyboardEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { cn } from "@/lib/utils";

function splitTokens(value: string) {
  return value
    .split(/[\s,;]+/u)
    .map((token) => token.trim())
    .filter(Boolean);
}

export function ChipInput({
  value,
  onValueChange,
  onBlur,
  placeholder,
  ariaLabel,
  className,
  disabled,
  inputMode = "text",
  ariaInvalid,
  ariaDescribedBy,
  formatToken = (token) => token,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
  onBlur?: () => void;
  placeholder?: string;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  inputMode?:
    | "none"
    | "text"
    | "decimal"
    | "numeric"
    | "tel"
    | "search"
    | "email"
    | "url";
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  formatToken?: (token: string) => string;
}) {
  const [draft, setDraft] = useState("");

  const addTokens = (raw: string) => {
    const tokens = splitTokens(raw);
    if (!tokens.length) return;
    const next = [...value];
    for (const token of tokens) {
      if (
        !next.some(
          (current) =>
            current.toLocaleLowerCase() === token.toLocaleLowerCase(),
        )
      )
        next.push(token);
    }
    onValueChange(next);
    setDraft("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter" || event.key === " " || event.key === ",") {
      event.preventDefault();
      addTokens(draft);
    } else if (event.key === "Backspace" && !draft && value.length) {
      onValueChange(value.slice(0, -1));
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text");
    if (!/[\s,;]/u.test(pasted)) return;
    event.preventDefault();
    addTokens(`${draft} ${pasted}`);
  };

  return (
    <div
      className={cn(
        "flex min-h-11 flex-wrap items-center gap-1.5 rounded-[7px] bg-[#EDF1E8] p-1.5 transition-colors focus-within:bg-white focus-within:ring-3 focus-within:ring-[#42664D]/30",
        className,
      )}
    >
      {value.map((token) => (
        <span
          key={token}
          className="inline-flex max-w-full items-center gap-1 rounded-md bg-[#DDE7D6] pl-2 text-xs font-medium text-[#1D2923]"
        >
          <span className="truncate">{formatToken(token)}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            aria-label={`Удалить ${token}`}
            onClick={() =>
              onValueChange(value.filter((current) => current !== token))
            }
            className="size-10 min-w-10 rounded-md text-[#42664D] hover:bg-[#CFDCC7]"
          >
            <X aria-hidden="true" />
          </Button>
        </span>
      ))}
      <TextInput
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid || undefined}
        aria-describedby={ariaDescribedBy}
        inputMode={inputMode}
        value={draft}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => {
          addTokens(draft);
          onBlur?.();
        }}
        className="h-10 min-w-[9rem] flex-1 rounded-none bg-transparent px-2 hover:bg-transparent focus:bg-transparent focus:ring-0"
      />
    </div>
  );
}
