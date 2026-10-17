"use client";

import { usePathname, useRouter } from "next/navigation";
import { AppLogo } from "@/components/layout/logo";
import { ProjectSwitcher } from "@/components/layout/project-switcher";
import { UserCard } from "@/components/layout/user-card";
import { Button } from "@/components/ui/button";
import { navigation } from "@/configs/consts/navigation.const";
import type { Account } from "@/configs/types/account.type";
import type { Project } from "@/configs/types/project.type";
import { cn } from "@/lib/utils";

export function Sidebar({
  account,
  project,
  projects,
  onSelectProject,
  onCreateProject,
  onOpenSettings,
  onLogout,
  onOpenAccountSettings,
}: {
  account: Account;
  project: Project;
  projects: Project[];
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onOpenAccountSettings: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <aside className="no-print fixed inset-y-0 left-0 z-20 hidden w-72 flex-col overflow-y-scroll overscroll-contain bg-white p-4 [scrollbar-gutter:stable] lg:flex">
      <AppLogo />
      <ProjectSwitcher
        project={project}
        projects={projects}
        onSelect={onSelectProject}
        onCreate={onCreateProject}
        onSettings={onOpenSettings}
      />
      <nav className="mt-6 grid gap-1">
        {navigation.map(({ id, label, href, Icon }) => (
          <Button
            variant="ghost"
            key={id}
            onClick={() => router.push(href)}
            className={cn(
              "h-11 justify-start gap-3 !rounded-[8px] px-3 text-left text-sm font-bold whitespace-normal transition-colors duration-200 active:scale-100",
              pathname === href
                ? "bg-[#1D2923] text-[#F4F1E9] hover:bg-[#1D2923] hover:text-[#F4F1E9]"
                : "text-[#42664D] hover:bg-[#EDF1E8] hover:text-[#42664D]",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Button>
        ))}
      </nav>
      <UserCard
        account={account}
        onLogout={onLogout}
        onOpenAccountSettings={onOpenAccountSettings}
      />
    </aside>
  );
}
