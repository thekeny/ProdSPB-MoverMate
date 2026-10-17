"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { AccountSettingsModal } from "@/components/layout/account-settings-modal";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { OfflineBanner } from "@/components/layout/offline-banner";
import { ProjectSettingsModal } from "@/components/layout/project-settings-modal";
import { PushPrompt } from "@/components/layout/push-prompt";
import { Sidebar } from "@/components/layout/sidebar";
import {
  LEGACY_PROJECTS_STORAGE_PREFIX,
  PROJECTS_STORAGE_PREFIX,
} from "@/configs/consts/storage.const";
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
  const { logout, changeUsername, changePassword, deleteAccount } = useAuth();
  const {
    projects,
    canEdit,
    setActiveId,
    updateProjectMeta,
    updateProject,
    addCollaborator,
    removeCollaborator,
    deleteProject,
  } = useProjects();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);

  useEffect(() => {
    [
      pages.DASHBOARD,
      pages.BOXES,
      pages.PLAN,
      pages.LABELS,
      pages.PROGRESS,
    ].forEach((path) => {
      router.prefetch(path);
    });
  }, [router]);

  const selectProject = (id: string) => {
    setActiveId(id);
    router.push(pages.DASHBOARD);
  };
  const createProject = () => router.push(pages.PROJECTS_NEW);
  const logoutAndGoHome = async () => {
    await logout();
    router.replace(pages.ROOT);
  };

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <OfflineBanner />
      <Sidebar
        account={account}
        project={project}
        projects={projects}
        canEdit={canEdit}
        onSelectProject={selectProject}
        onCreateProject={createProject}
        onOpenSettings={() => setSettingsOpen(true)}
        onLogout={logoutAndGoHome}
        onOpenAccountSettings={() => setAccountSettingsOpen(true)}
      />
      <main className="mx-auto min-w-0 max-w-[1240px] px-6 pb-24 pt-6 sm:px-8 lg:ml-72 lg:px-10 lg:py-10 xl:px-12">
        <MobileHeader
          project={project}
          projects={projects}
          canEdit={canEdit}
          onSelectProject={selectProject}
          onCreateProject={createProject}
          onOpenSettings={() => setSettingsOpen(true)}
          onLogout={logoutAndGoHome}
          onOpenAccountSettings={() => setAccountSettingsOpen(true)}
        />
        <PushPrompt />
        {children}
      </main>
      <MobileNav />
      {settingsOpen && canEdit && (
        <ProjectSettingsModal
          project={project}
          canDelete={project.ownerId === account.id}
          onClose={() => setSettingsOpen(false)}
          onSave={async (values) => {
            await updateProjectMeta(values);
            setSettingsOpen(false);
          }}
          onDelete={async () => {
            setSettingsOpen(false);
            await deleteProject();
          }}
          onUpdateProject={updateProject}
          onAddMember={addCollaborator}
          onRemoveMember={removeCollaborator}
        />
      )}
      {accountSettingsOpen && canEdit && (
        <AccountSettingsModal
          username={account.username}
          onClose={() => setAccountSettingsOpen(false)}
          onChangeUsername={changeUsername}
          onChangePassword={async (values) => {
            await changePassword(values);
            setAccountSettingsOpen(false);
            router.replace(pages.ROOT);
          }}
          onDeleteAccount={async () => {
            await deleteAccount();
            try {
              localStorage.removeItem(
                `${PROJECTS_STORAGE_PREFIX}:${account.id}`,
              );
              localStorage.removeItem(
                `${LEGACY_PROJECTS_STORAGE_PREFIX}:${account.id}`,
              );
            } catch {
              // Account deletion succeeded even if browser storage cannot be cleared.
            }
            setAccountSettingsOpen(false);
            router.replace(pages.ROOT);
          }}
        />
      )}
    </div>
  );
}
