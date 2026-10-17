"use client";

import { ProgressView } from "@/components/movermate/pages/progress-view";
import { useMoverMate } from "@/components/movermate/store";
import { Box, rooms } from "@/configs/consts/movermate.const";

export function ProgressPageClient() {
  const { project, updateProject } = useMoverMate();
  if (!project) return null;
  const currentProject = project;
  return (
    <ProgressView
      project={currentProject}
      roomIcon={(name) => rooms.find((room) => room.name === name)?.Icon ?? Box}
      updateProject={updateProject}
    />
  );
}
