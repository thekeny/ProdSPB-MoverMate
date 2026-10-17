"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { pages } from "@/configs/paths/pages.path";
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
    if (!account) router.replace(pages.LOGIN);
    else if (!project) router.replace(pages.PROJECTS);
  }, [account, project, ready, router]);

  if (!ready) return <LoadingScreen />;
  if (!account || !project) return <LoadingScreen />;
  return (
    <AppShell account={account} project={project}>
      {children}
    </AppShell>
  );
}
