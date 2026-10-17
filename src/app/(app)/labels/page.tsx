"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getBoxLabels } from "@/api/generated";
import { unwrap } from "@/api/request";
import { LabelsView } from "@/app/(app)/labels/_components/labels-view";
import { BoxDetails } from "@/components/box/box-details";
import { ApiQueryError } from "@/components/ui/api-query-error";
import { QUERY_KEYS } from "@/configs/consts/api.const";
import { isConnected } from "@/lib/connectivity";
import { useProjects } from "@/providers/projects-provider";

export default function LabelsPage() {
  const { project, updateProject, changeBoxStatus, canEdit } = useProjects();
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const projectId = project?.id;
  const labelsQuery = useQuery({
    queryKey: QUERY_KEYS.BOX_LABELS(projectId ?? ""),
    enabled: Boolean(projectId),
    queryFn: () =>
      unwrap(getBoxLabels({ path: { project_id: projectId as string } })),
  });

  useEffect(() => {
    if (!projectId) return;
    setSelectedBox(null);
  }, [projectId]);

  if (!project) return null;
  const currentProject = project;
  const box = currentProject.boxes.find((item) => item.id === selectedBox);
  return (
    <>
      {labelsQuery.isError && !labelsQuery.data && isConnected() && (
        <ApiQueryError error={labelsQuery.error} />
      )}
      <LabelsView
        project={project}
        labels={labelsQuery.data}
        onSelect={setSelectedBox}
      />
      {box && (
        <BoxDetails
          box={box}
          project={currentProject}
          canEdit={canEdit}
          onClose={() => setSelectedBox(null)}
          updateProject={updateProject}
          changeBoxStatus={changeBoxStatus}
          onDelete={() => {
            updateProject((current) => ({
              ...current,
              boxes: current.boxes.filter((item) => item.id !== selectedBox),
              items: current.items.filter((item) => item.boxId !== selectedBox),
            }));
            setSelectedBox(null);
          }}
        />
      )}
    </>
  );
}
