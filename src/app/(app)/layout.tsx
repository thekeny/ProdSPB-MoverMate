"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { pages } from "@/configs/paths/pages.path";
import { isConnected } from "@/lib/connectivity";
import { useAuth } from "@/providers/auth-provider";
import { useProjects } from "@/providers/projects-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const auth = useAuth();
  const projects = useProjects();
  const { account, ready: authReady } = auth;
  const { project, ready: projectsReady } = projects;
  const ready = authReady && projectsReady;

  useEffect(() => {
    if (!ready) return;
    if (!account) router.replace(pages.ROOT);
    else if (!project) router.replace(pages.PROJECTS);
  }, [account, project, ready, router]);

  if (!authReady) return <LoadingScreen />;
  if (account && !projectsReady && !isConnected())
    return (
      <main className="mx-auto flex min-h-screen max-w-lg items-center px-6 py-12">
        <p className="rounded-lg bg-[#A84D3C] p-5 text-sm font-medium text-white">
          Не удалось восстановить сохранённый проект. Подключитесь к интернету,
          чтобы загрузить данные для офлайн-работы.
        </p>
      </main>
    );
  if (!ready) return <LoadingScreen />;
  if (!account || !project) return <LoadingScreen />;
  return (
    <AppShell account={account} project={project}>
      {children}
    </AppShell>
  );
}
