"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
    if (!ready) return;
    router.replace(
      account ? (project ? pages.DASHBOARD : pages.PROJECTS) : pages.LOGIN,
    );
  }, [account, project, ready, router]);

  return <LoadingScreen />;
}
