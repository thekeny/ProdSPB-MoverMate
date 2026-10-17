import { Menu } from "@base-ui/react/menu";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function DropdownMenu(props: ComponentProps<typeof Menu.Root>) {
  return <Menu.Root modal={false} {...props} />;
}

const DropdownMenuTrigger = Menu.Trigger;
const DropdownMenuPortal = Menu.Portal;

function DropdownMenuPositioner({
  className,
  ...props
}: ComponentProps<typeof Menu.Positioner>) {
  return <Menu.Positioner className={cn("z-50", className)} {...props} />;
}
const DropdownMenuContent = Menu.Popup;
const DropdownMenuItem = Menu.Item;
const DropdownMenuSeparator = Menu.Separator;

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};
