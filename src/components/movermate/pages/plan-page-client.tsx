"use client";

import { useState } from "react";
import { TaskForm } from "@/components/movermate/forms";
import { PlanView } from "@/components/movermate/pages/plan-view";
import { useMoverMate } from "@/components/movermate/store";
import { uid } from "@/configs/consts/movermate.const";

const TASK_TEMPLATE: [string, "before" | "moving" | "after", string][] = [
  ["Уведомить управляющую компанию", "before", "За неделю"],
  ["Сфотографировать счетчики", "moving", "В день переезда"],
  ["Проверить доставку коробок", "after", "После переезда"],
];

export function PlanPageClient() {
  const { project, addTask, updateProject } = useMoverMate();
  const [showForm, setShowForm] = useState(false);
  const [templateNotice, setTemplateNotice] = useState<string | null>(null);
  if (!project) return null;
  return (
    <>
      {
        <PlanView
          project={project}
          onAdd={() => setShowForm(true)}
          templateNotice={templateNotice}
          onAddTemplates={() => {
            const existing = new Set(project.tasks.map((task) => task.title));
            const fresh = TASK_TEMPLATE.filter(
              ([title]) => !existing.has(title),
            );
            if (!fresh.length) {
              setTemplateNotice("Все задачи шаблона уже добавлены.");
              return;
            }
            updateProject((current) => ({
              ...current,
              tasks: [
                ...current.tasks,
                ...fresh.map(([title, stage, due]) => ({
                  id: uid("task"),
                  title,
                  stage,
                  assignee: "",
                  due,
                  done: false,
                })),
              ],
            }));
            setTemplateNotice(`Добавлено задач: ${fresh.length}.`);
          }}
          updateProject={updateProject}
        />
      }
      {showForm && (
        <TaskForm
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
