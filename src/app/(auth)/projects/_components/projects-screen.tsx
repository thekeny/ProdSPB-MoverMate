"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProjectFlow } from "@/app/(auth)/projects/_components/project-flow";
import { pages } from "@/configs/paths/pages.path";
import type { ProjectFlowMode } from "@/configs/types/project.type";
import { useAuth } from "@/providers/auth-provider";
import { useProjects } from "@/providers/projects-provider";

export function ProjectsScreen({ create = false }: { create?: boolean }) {
  const router = useRouter();
  const { ready, account } = useAuth();
  const { projects, setActiveId, createProject, canEdit } = useProjects();
  const [mode, setMode] = useState<ProjectFlowMode>(
    create ? "create" : "select",
  );

  useEffect(() => {
    if (ready && !account) router.replace(pages.LOGIN);
  }, [account, ready, router]);

  useEffect(() => {
    if (!canEdit) setMode("select");
  }, [canEdit]);

  if (!ready || !account) return null;
  return (
    <ProjectFlow
      projects={projects}
      mode={canEdit ? mode : "select"}
      canEdit={canEdit}
      setMode={setMode}
      setActiveId={(id) => {
        setActiveId(id);
        router.push(pages.DASHBOARD);
      }}
      onCreate={createProject}
    />
  );
}
