"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LandingPage } from "@/app/_components/landing-page";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { pages } from "@/configs/paths/pages.path";
import { useAuth } from "@/providers/auth-provider";
import { useProjects } from "@/providers/projects-provider";

export default function HomePage() {
  const router = useRouter();
  const { account, ready: authReady } = useAuth();
  const { project, ready: projectsReady } = useProjects();
  const ready = authReady && projectsReady;

  useEffect(() => {
    if (!ready || !account) return;
    router.replace(project ? pages.DASHBOARD : pages.PROJECTS);
  }, [account, project, ready, router]);

  if (!ready || account) return <LoadingScreen />;
  return <LandingPage />;
}
