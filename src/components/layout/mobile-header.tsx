"use client";

import { LogOut, Settings } from "lucide-react";
import { AppLogo } from "@/components/layout/logo";
import { ProjectSwitcher } from "@/components/layout/project-switcher";
import { Button } from "@/components/ui/button";
import type { Project } from "@/configs/types/project.type";

export function MobileHeader({
  project,
  projects,
  onSelectProject,
  onCreateProject,
  onOpenSettings,
  onLogout,
  onOpenAccountSettings,
}: {
  project: Project;
  projects: Project[];
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onOpenAccountSettings: () => void;
}) {
  return (
    <header className="no-print mb-8 flex items-center justify-between lg:hidden">
      <AppLogo small />
      <div className="flex items-center gap-1">
        <ProjectSwitcher
          compact
          project={project}
          projects={projects}
          onSelect={onSelectProject}
          onCreate={onCreateProject}
          onSettings={onOpenSettings}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenAccountSettings}
          aria-label="Настройки аккаунта"
        >
          <Settings />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onLogout}
          aria-label="Выйти"
        >
          <LogOut />
        </Button>
      </div>
    </header>
  );
}
