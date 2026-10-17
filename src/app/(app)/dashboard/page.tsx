"use client";

import { DashboardView } from "@/app/(app)/dashboard/_components/dashboard-view";
import { useProjects } from "@/providers/projects-provider";

export default function DashboardPage() {
  const { project, updateProject } = useProjects();
  if (!project) return null;
  return <DashboardView project={project} updateProject={updateProject} />;
}
