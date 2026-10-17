"use client";

import { useState } from "react";
import { PlanView } from "@/app/(app)/plan/_components/plan-view";
import { TaskForm } from "@/app/(app)/plan/_components/task-form";
import { useProjects } from "@/providers/projects-provider";

export default function PlanPage() {
  const { project, addTask, updateProject, canEdit } = useProjects();
  const [showForm, setShowForm] = useState(false);
  if (!project) return null;
  return (
    <>
      <PlanView
        key={project.id}
        project={project}
        canEdit={canEdit}
        onAdd={() => setShowForm(true)}
        updateProject={updateProject}
      />
      {showForm && canEdit && (
        <TaskForm
          members={project.members}
          onClose={() => setShowForm(false)}
          onSubmit={addTask}
        />
      )}
    </>
  );
}
