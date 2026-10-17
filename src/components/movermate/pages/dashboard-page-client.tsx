"use client";

import { DashboardView } from "@/components/movermate/pages/dashboard-view";
import { useMoverMate } from "@/components/movermate/store";

export function DashboardPageClient() {
  const { project, updateProject } = useMoverMate();
  if (!project) return null;

  return <DashboardView project={project} updateProject={updateProject} />;
}
