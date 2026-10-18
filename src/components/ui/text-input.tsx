import { Input } from "@base-ui/react/input";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function TextInput({ className, ...props }: ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="text-input"
      className={cn(
        "h-11 w-full min-w-0 rounded-[7px] bg-[#EDF1E8] px-3 text-sm text-[#1D2923] outline-none transition-colors placeholder:text-[#5C6560] hover:bg-[#E2E9DD] focus:bg-white focus:ring-3 focus:ring-[#42664D]/30 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { TextInput };
