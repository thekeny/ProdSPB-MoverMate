"use client";

import { ProgressView } from "@/app/(app)/progress/_components/progress-view";
import { useProjects } from "@/providers/projects-provider";

export default function ProgressPage() {
  const { project, updateProject } = useProjects();
  if (!project) return null;
  return <ProgressView project={project} updateProject={updateProject} />;
}
