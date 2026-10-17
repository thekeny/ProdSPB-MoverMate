import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Check } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Checkbox({
  className,
  ...props
}: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "relative inline-flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-[5px] bg-[#E2E9DD] outline-none transition-[background-color,transform] duration-200 ease-out hover:scale-105 hover:bg-[#D6E1D0] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#D96B4C] data-[checked]:bg-[#42664D] data-[checked]:hover:bg-[#355540] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex text-white">
        <Check className="size-3" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
