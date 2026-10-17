"use client";

import { useEffect, useState } from "react";
import { LabelsView } from "@/app/(app)/labels/_components/labels-view";
import { BoxDetails } from "@/components/box/box-details";
import { useProjects } from "@/providers/projects-provider";

export default function LabelsPage() {
  const { project, updateProject } = useProjects();
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const projectId = project?.id;

  useEffect(() => {
    if (!projectId) return;
    setSelectedBox(null);
  }, [projectId]);

  if (!project) return null;
  const currentProject = project;
  const box = currentProject.boxes.find((item) => item.id === selectedBox);
  return (
    <>
      <LabelsView project={project} onSelect={setSelectedBox} />
      {box && (
        <BoxDetails
          box={box}
          project={currentProject}
          onClose={() => setSelectedBox(null)}
          updateProject={updateProject}
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
