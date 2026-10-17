import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-[#CFCABD] p-0.5 outline-none transition-colors data-[checked]:bg-[#42664D] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#D96B4C] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="size-5 rounded-full bg-white transition-transform data-[checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
