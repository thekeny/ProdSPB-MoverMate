"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectSummary } from "@/api/generated";
import { unwrap } from "@/api/request";
import { DashboardView } from "@/app/(app)/dashboard/_components/dashboard-view";
import { ApiQueryError } from "@/components/ui/api-query-error";
import { QUERY_KEYS } from "@/configs/consts/api.const";
import { isConnected } from "@/lib/connectivity";
import { useProjects } from "@/providers/projects-provider";

export default function DashboardPage() {
  const { project, updateProject, canEdit } = useProjects();
  const summary = useQuery({
    queryKey: QUERY_KEYS.PROJECT_SUMMARY(project?.id ?? ""),
    enabled: Boolean(project?.id),
    queryFn: () =>
      unwrap(getProjectSummary({ path: { project_id: project?.id ?? "" } })),
  });
  if (!project) return null;
  return (
    <>
      {summary.isError && !summary.data && isConnected() && (
        <ApiQueryError error={summary.error} />
      )}
      <DashboardView
        project={project}
        summary={summary.data}
        updateProject={updateProject}
        canEdit={canEdit}
      />
    </>
  );
}
