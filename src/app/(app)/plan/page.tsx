"use client";

import { useState } from "react";
import { PlanView } from "@/app/(app)/plan/_components/plan-view";
import { TaskForm } from "@/app/(app)/plan/_components/task-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Modal } from "@/components/ui/modal";
import { TASK_STAGE_OPTIONS } from "@/configs/consts/task-stages.const";
import { TASK_TEMPLATES } from "@/configs/consts/task-templates.const";
import { uid } from "@/lib/id";
import { useProjects } from "@/providers/projects-provider";

function taskTitleKey(value: string) {
  return value.trim().toLocaleLowerCase("ru").replace(/\s+/g, " ");
}

export default function PlanPage() {
  const { project, addTask, updateProject } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [templateNotice, setTemplateNotice] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  if (!project) return null;
  return (
    <>
      <PlanView
        project={project}
        onAdd={() => setShowForm(true)}
        templateNotice={templateNotice}
        onAddTemplates={() => setShowTemplates(true)}
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
      {showTemplates && (
        <Modal
          className="max-w-md"
          label="Шаблоны задач"
          onClose={() => setShowTemplates(false)}
        >
          <h2 className="text-xl font-extrabold">Шаблоны задач</h2>
          <div className="mt-5 grid gap-4">
            {TASK_STAGE_OPTIONS.map((stage) => (
              <section key={stage.value}>
                <h3 className="mb-2 text-sm font-bold">{stage.label}</h3>
                {TASK_TEMPLATES.filter(
                  (template) => template.stage === stage.value,
                ).map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center gap-3 rounded-md bg-[#F5F3EE] p-3 text-sm"
                  >
                    <Checkbox
                      aria-label={`Выбрать ${template.title}`}
                      checked={selectedTemplates.includes(template.id)}
                      onCheckedChange={() =>
                        setSelectedTemplates((current) =>
                          current.includes(template.id)
                            ? current.filter((id) => id !== template.id)
                            : [...current, template.id],
                        )
                      }
                    />
                    <span>
                      {template.title}
                      {project.tasks.some(
                        (task) =>
                          taskTitleKey(task.title) ===
                          taskTitleKey(template.title),
                      ) && (
                        <span className="block text-xs text-[#68716C]">
                          Похожая задача уже есть
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </section>
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowTemplates(false)}>
              Отмена
            </Button>
            <Button
              disabled={!selectedTemplates.length}
              onClick={() => {
                const chosen = TASK_TEMPLATES.filter((template) =>
                  selectedTemplates.includes(template.id),
                );
                updateProject((current) => ({
                  ...current,
                  tasks: [
                    ...current.tasks,
                    ...chosen.map((template) => ({
                      id: uid("task"),
                      title: template.title,
                      description: "",
                      stage: template.stage,
                      assignees: [],
                      dueAt: null,
                      done: false,
                    })),
                  ],
                }));
                setTemplateNotice(`Добавлено задач: ${chosen.length}.`);
                setSelectedTemplates([]);
                setShowTemplates(false);
              }}
            >
              Добавить выбранные
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
