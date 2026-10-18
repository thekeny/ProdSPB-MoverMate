"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { navigation } from "@/configs/consts/navigation.const";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-20 grid h-[calc(4rem+env(safe-area-inset-bottom))] grid-cols-5 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      {navigation.map(({ id, label, href, Icon }) => (
        <Button
          variant="ghost"
          key={id}
          onClick={() => router.push(href)}
          className={cn(
            "h-14 flex-col gap-0 rounded-none px-0 text-[10px] font-bold whitespace-normal transition-colors active:scale-100 hover:bg-transparent",
            pathname === href
              ? "text-[#1D2923] hover:text-[#1D2923]"
              : "text-[#5C6560] hover:text-[#5C6560]",
          )}
        >
          <span className="grid place-items-center gap-1">
            <span
              className={cn(
                "grid size-8 place-items-center rounded-full transition-colors",
                pathname === href && "bg-[#E2E9DD]",
              )}
            >
              <Icon
                className={cn("size-5", pathname === href && "text-[#42664D]")}
              />
            </span>
            {label}
          </span>
        </Button>
      ))}
    </nav>
  );
}
