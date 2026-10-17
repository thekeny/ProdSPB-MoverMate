import { Check, ChevronsUpDown, Plus, Settings2 } from "lucide-react";
import { useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project } from "@/configs/types/project.type";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProjectSwitcher({
  project,
  projects,
  onSelect,
  onCreate,
  onSettings,
  compact = false,
}: {
  project: Project;
  projects: Project[];
  onSelect: (id: string) => void;
  onCreate: () => void;
  onSettings: () => void;
  compact?: boolean;
}) {
  const sidebarMenuContainerRef = useRef<HTMLDivElement>(null);
  const menuPositioner = (
    <DropdownMenuPositioner
      className={cn(!compact && "static! mt-2 w-full transform-none!")}
      side="bottom"
      align={compact ? "end" : "start"}
      sideOffset={compact ? 10 : 8}
      collisionPadding={compact ? 20 : 16}
    >
      <DropdownMenuContent
        className={cn(
          "rounded-lg p-2 text-[#1D2923] outline-none transition-[opacity,translate] duration-200 ease-out data-ending-style:translate-y-1 data-ending-style:opacity-0 data-starting-style:translate-y-1 data-starting-style:opacity-0 motion-reduce:transition-none",
          compact
            ? "w-72 max-w-[calc(100vw-2.5rem)] bg-white"
            : "w-full bg-[#E2E9DD] ring-1 ring-[#CFCABD]/70",
        )}
      >
        <p className="px-3 py-2 text-[10px] font-extrabold tracking-[0.12em] text-[#68716C] uppercase">
          Ваши проекты
        </p>
        {projects.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 outline-none select-none data-highlighted:bg-[#EDF1E8]"
          >
            <span className="min-w-0 flex-1">
              <span className="block break-words text-sm font-bold">
                {item.name}
              </span>
              <span className="mt-0.5 block text-xs text-[#68716C]">
                {formatDate(item.date)}
              </span>
            </span>
            {item.id === project.id && (
              <Check className="size-4 shrink-0 text-[#42664D]" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="my-2 h-px bg-[#CFCABD]" />
        <DropdownMenuItem
          onClick={onCreate}
          className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 text-sm font-bold text-[#42664D] outline-none select-none data-highlighted:bg-[#EDF1E8]"
        >
          <Plus className="size-4" />
          Создать проект
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onSettings}
          className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 text-sm font-bold text-[#42664D] outline-none select-none data-highlighted:bg-[#EDF1E8]"
        >
          <Settings2 className="size-4" />
          Настройки проекта
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPositioner>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Переключить проект"
        className={cn(
          "group mt-8 flex w-full items-center gap-3 rounded-lg bg-[#EDF1E8] px-4 py-3 text-left transition-colors duration-200 hover:bg-[#E2E9DD] focus-visible:ring-3 focus-visible:ring-[#42664D]/30",
          compact && "mt-0 max-w-44 px-3 py-2",
        )}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold">
            {project.name}
          </span>
          <span
            className={cn(
              "tnum mt-0.5 block text-xs text-[#68716C]",
              compact && "hidden sm:block",
            )}
          >
            {formatDate(project.date)}
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-[#42664D] transition-transform group-data-popup-open:rotate-180" />
      </DropdownMenuTrigger>
      <div
        ref={sidebarMenuContainerRef}
        className={cn(!compact && "w-full")}
        hidden={compact || undefined}
      />
      <DropdownMenuPortal
        container={compact ? undefined : sidebarMenuContainerRef}
      >
        {menuPositioner}
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
