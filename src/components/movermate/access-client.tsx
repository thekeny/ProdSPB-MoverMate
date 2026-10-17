"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthScreen, ProjectFlow } from "@/components/movermate/access";
import { useMoverMate } from "@/components/movermate/store";
import { pages } from "@/configs/paths/pages.path";

export function LoginPageClient() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { authenticate } = useMoverMate();
  return (
    <AuthScreen
      mode={mode}
      setMode={setMode}
      onSubmit={(event) => authenticate(event, mode)}
    />
  );
}

export function ProjectsPageClient({ create = false }: { create?: boolean }) {
  const router = useRouter();
  const { ready, account, projects, setActiveId, createProject } =
    useMoverMate();
  const [mode, setMode] = useState<"select" | "create">(
    create ? "create" : "select",
  );

  useEffect(() => {
    if (ready && !account) router.replace(pages.LOGIN);
  }, [account, ready, router]);

  if (!ready || !account) return null;
  return (
    <ProjectFlow
      projects={projects}
      mode={mode}
      setMode={setMode}
      setActiveId={(id) => {
        setActiveId(id);
        router.push(pages.DASHBOARD);
      }}
      onCreate={createProject}
    />
  );
}
