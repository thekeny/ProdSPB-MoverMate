"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ProjectSettingsModal } from "@/components/layout/project-settings-modal";
import { Sidebar } from "@/components/layout/sidebar";
import { pages } from "@/configs/paths/pages.path";
import type { Account } from "@/configs/types/account.type";
import type { Project } from "@/configs/types/project.type";
import { useAuth } from "@/providers/auth-provider";
import { useProjects } from "@/providers/projects-provider";

export function AppShell({
  account,
  project,
  children,
}: {
  account: Account;
  project: Project;
  children: ReactNode;
}) {
  const router = useRouter();
  const { logout } = useAuth();
  const { projects, setActiveId, updateProjectMeta, deleteProject } =
    useProjects();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const selectProject = (id: string) => {
    setActiveId(id);
    router.push(pages.DASHBOARD);
  };
  const createProject = () => router.push(pages.PROJECTS_NEW);

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <Sidebar
        account={account}
        project={project}
        projects={projects}
        onSelectProject={selectProject}
        onCreateProject={createProject}
        onOpenSettings={() => setSettingsOpen(true)}
        onLogout={logout}
      />
      <main className="mx-auto min-w-0 max-w-[1240px] px-5 pb-24 pt-6 lg:ml-72 lg:px-10 lg:py-10 xl:px-12">
        <MobileHeader
          project={project}
          projects={projects}
          onSelectProject={selectProject}
          onCreateProject={createProject}
          onOpenSettings={() => setSettingsOpen(true)}
          onLogout={logout}
        />
        {children}
      </main>
      <MobileNav />
      {settingsOpen && (
        <ProjectSettingsModal
          project={project}
          canDelete={projects.length > 0}
          onClose={() => setSettingsOpen(false)}
          onSave={(values) => {
            updateProjectMeta(values);
            setSettingsOpen(false);
          }}
          onDelete={() => {
            setSettingsOpen(false);
            deleteProject();
          }}
        />
      )}
    </div>
  );
}
