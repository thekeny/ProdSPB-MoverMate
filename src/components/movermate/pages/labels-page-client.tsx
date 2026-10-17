"use client";

import { useEffect, useState } from "react";
import { BoxDetails } from "@/components/movermate/box-details";
import { LabelsView } from "@/components/movermate/pages/labels-view";
import { useMoverMate } from "@/components/movermate/store";

export function LabelsPageClient() {
  const { project, updateProject } = useMoverMate();
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const projectId = project?.id;

  useEffect(() => {
    if (!projectId) return;
    setSelectedBox(null);
  }, [projectId]);

  if (!project) return null;
  const currentProject = project;
  const box = currentProject.boxes.find((item) => item.id === selectedBox);
  const update = (
    apply: (
      value: (typeof currentProject.boxes)[number],
    ) => (typeof currentProject.boxes)[number],
  ) =>
    updateProject((current) => ({
      ...current,
      boxes: current.boxes.map((item) =>
        item.id === selectedBox ? apply(item) : item,
      ),
    }));
  return (
    <>
      <LabelsView project={project} onSelect={setSelectedBox} />
      {box && (
        <BoxDetails
          box={box}
          onClose={() => setSelectedBox(null)}
          update={update}
          onDelete={() => {
            updateProject((current) => ({
              ...current,
              boxes: current.boxes.filter((item) => item.id !== selectedBox),
            }));
            setSelectedBox(null);
          }}
        />
      )}
    </>
  );
}
