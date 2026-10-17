"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getLoadingChecklist,
  getProjectSummary,
  getUnpackingProgress,
} from "@/api/generated";
import { unwrap } from "@/api/request";
import { ProgressView } from "@/app/(app)/progress/_components/progress-view";
import { ApiQueryError } from "@/components/ui/api-query-error";
import { QUERY_KEYS } from "@/configs/consts/api.const";
import { isConnected } from "@/lib/connectivity";
import { useProjects } from "@/providers/projects-provider";

export default function ProgressPage() {
  const { project, updateProject, canEdit } = useProjects();
  const checklist = useQuery({
    queryKey: QUERY_KEYS.LOADING_CHECKLIST(project?.id ?? ""),
    enabled: Boolean(project?.id),
    queryFn: () =>
      unwrap(getLoadingChecklist({ path: { project_id: project?.id ?? "" } })),
  });
  const unpacking = useQuery({
    queryKey: QUERY_KEYS.UNPACKING_PROGRESS(project?.id ?? ""),
    enabled: Boolean(project?.id),
    queryFn: () =>
      unwrap(getUnpackingProgress({ path: { project_id: project?.id ?? "" } })),
  });
  const summary = useQuery({
    queryKey: QUERY_KEYS.PROJECT_SUMMARY(project?.id ?? ""),
    enabled: Boolean(project?.id),
    queryFn: () =>
      unwrap(getProjectSummary({ path: { project_id: project?.id ?? "" } })),
  });
  if (!project) return null;
  return (
    <>
      {checklist.isError && !checklist.data && isConnected() && (
        <ApiQueryError error={checklist.error} />
      )}
      {unpacking.isError && !unpacking.data && isConnected() && (
        <ApiQueryError error={unpacking.error} />
      )}
      {summary.isError && !summary.data && isConnected() && (
        <ApiQueryError error={summary.error} />
      )}
      <ProgressView
        key={project.id}
        project={project}
        canEdit={canEdit}
        loadingChecklist={checklist.data}
        unpackingProgress={unpacking.data}
        boxStatusCounts={summary.data?.boxes.by_status}
        updateProject={updateProject}
      />
    </>
  );
}
