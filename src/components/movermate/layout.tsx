"use client";

import { LogOut, UserRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Settings } from "@/components/movermate/forms";
import { ProjectSwitcher } from "@/components/movermate/project-switcher";
import { useMoverMate } from "@/components/movermate/store";
import { Logo } from "@/components/movermate/ui";
import { Button } from "@/components/ui/button";
import { navigation } from "@/configs/consts/movermate.const";
import { pages } from "@/configs/paths/pages.path";
import { cn } from "@/lib/utils";

const VIEW_ROUTES: Record<(typeof navigation)[number]["id"], string> = {
  dashboard: pages.DASHBOARD,
  boxes: pages.BOXES,
  plan: pages.PLAN,
  labels: pages.LABELS,
  progress: pages.PROGRESS,
};

export function MoverMateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    ready,
    account,
    project,
    projects,
    setActiveId,
    updateProjectMeta,
    deleteProject,
    logout,
  } = useMoverMate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const privateRoute = !(
    [pages.LOGIN, pages.PROJECTS, pages.PROJECTS_NEW] as readonly string[]
  ).includes(pathname);

  const selectProject = (id: string) => {
    setActiveId(id);
    router.push(pages.DASHBOARD);
  };

  useEffect(() => {
    if (!ready) return;
    if (privateRoute && !account) router.replace(pages.LOGIN);
    else if (privateRoute && account && !project)
      router.replace(pages.PROJECTS);
    else if (pathname === pages.LOGIN && account)
      router.replace(project ? pages.DASHBOARD : pages.PROJECTS);
  }, [account, pathname, privateRoute, project, ready, router]);

  if (!ready)
    return (
      <main className="grid min-h-screen place-items-center bg-[#F5F3EE] p-6">
        <div className="text-center">
          <div className="mx-auto size-10 animate-pulse rounded-2xl bg-[#E2E9DD]" />
          <p className="mt-4 text-sm font-bold text-[#1D2923]">Загрузка…</p>
        </div>
      </main>
    );
  if (privateRoute && account && project)
    return (
      <div className="min-h-screen bg-[#F5F3EE]">
        <aside className="no-print fixed inset-y-0 left-0 z-20 hidden w-72 flex-col bg-white p-4 lg:flex">
          <Logo />
          <ProjectSwitcher
            project={project}
            projects={projects}
            onSelect={selectProject}
            onCreate={() => router.push(pages.PROJECTS_NEW)}
            onSettings={() => setSettingsOpen(true)}
          />
          <nav className="mt-6 grid gap-1">
            {navigation.map(({ id, label, Icon }) => {
              const route = VIEW_ROUTES[id];
              return (
                <button
                  type="button"
                  key={id}
                  onClick={() => router.push(route)}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-bold transition-colors duration-200",
                    pathname === route
                      ? "bg-[#1D2923] text-[#F4F1E9]"
                      : "text-[#42664D] hover:bg-[#EDF1E8]",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto flex items-center justify-between rounded-2xl bg-[#EDF1E8] p-3">
            <span className="flex items-center gap-2 text-xs font-bold">
              <UserRound className="size-4 text-[#42664D]" />
              {account.username}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={logout}
              aria-label="Выйти"
            >
              <LogOut />
            </Button>
          </div>
        </aside>
        <main className="mx-auto min-w-0 max-w-[1240px] px-5 pb-24 pt-6 lg:ml-72 lg:px-10 lg:py-10 xl:px-12">
          <header className="no-print mb-8 flex items-center justify-between lg:hidden">
            <Logo small />
            <div className="flex items-center gap-1">
              <ProjectSwitcher
                compact
                project={project}
                projects={projects}
                onSelect={selectProject}
                onCreate={() => router.push(pages.PROJECTS_NEW)}
                onSettings={() => setSettingsOpen(true)}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                aria-label="Выйти"
              >
                <LogOut />
              </Button>
            </div>
          </header>
          {children}
        </main>
        <nav className="no-print fixed inset-x-0 bottom-0 z-20 grid h-[calc(4rem+env(safe-area-inset-bottom))] grid-cols-5 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
          {navigation.map(({ id, label, Icon }) => {
            const route = VIEW_ROUTES[id];
            return (
              <button
                type="button"
                key={id}
                onClick={() => router.push(route)}
                className={cn(
                  "grid h-14 place-items-center text-[10px] font-bold transition-colors",
                  pathname === route ? "text-[#1D2923]" : "text-[#68716C]",
                )}
              >
                <span className="grid place-items-center gap-1">
                  <span
                    className={cn(
                      "grid size-8 place-items-center rounded-full transition-colors",
                      pathname === route && "bg-[#E2E9DD]",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-5",
                        pathname === route && "text-[#42664D]",
                      )}
                    />
                  </span>
                  {label}
                </span>
              </button>
            );
          })}
        </nav>
        {settingsOpen && (
          <Settings
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
  if (privateRoute) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F5F3EE] p-6">
        <div className="text-center">
          <p className="text-sm font-bold text-[#1D2923]">Загрузка…</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
