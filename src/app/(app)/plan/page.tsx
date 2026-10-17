"use client";

import { useState } from "react";
import { PlanView } from "@/app/(app)/plan/_components/plan-view";
import { TaskForm } from "@/app/(app)/plan/_components/task-form";
import { useProjects } from "@/providers/projects-provider";

export default function PlanPage() {
  const { project, addTask, updateProject } = useProjects();
  const [showForm, setShowForm] = useState(false);
  if (!project) return null;
  return (
    <>
      <PlanView
        project={project}
        onAdd={() => setShowForm(true)}
        updateProject={updateProject}
      />
      {showForm && (
        <TaskForm
          members={project.members}
          onClose={() => setShowForm(false)}
          onSubmit={(event) => {
            addTask(event);
            setShowForm(false);
          }}
        />
      )}
    </>
  );
}
