import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createTasksFromTemplates, listTaskTemplates } from "@/api/generated";
import { unwrap } from "@/api/request";
import { ApiQueryError } from "@/components/ui/api-query-error";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Modal } from "@/components/ui/modal";
import { QUERY_KEYS } from "@/configs/consts/api.const";
import { TASK_STAGE_OPTIONS } from "@/configs/consts/task-stages.const";
import type { Project } from "@/configs/types/project.type";

export function TaskTemplatesModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const templates = useQuery({
    queryKey: QUERY_KEYS.TASK_TEMPLATES,
    queryFn: () => unwrap(listTaskTemplates()),
  });
  const mutation = useMutation({
    mutationFn: () =>
      unwrap(
        createTasksFromTemplates({
          path: { project_id: project.id },
          body: { template_ids: selected },
        }),
      ),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({
          queryKey: QUERY_KEYS.PROJECT_DATA(project.id),
        }),
        client.invalidateQueries({
          queryKey: QUERY_KEYS.PROJECT_SUMMARY(project.id),
        }),
      ]);
      onClose();
    },
  });
  return (
    <Modal
      label="Добавить шаблоны задач"
      onClose={mutation.isPending ? undefined : onClose}
      className="max-w-xl"
    >
      <h2 className="text-2xl font-extrabold">Шаблоны задач</h2>
      <p className="mt-2 text-sm text-[#68716C]">
        Выберите нужные задачи. Повторное добавление создаёт ещё одну копию.
      </p>
      <ApiQueryError error={templates.error || mutation.error} />
      {templates.isError && (
        <Button variant="outline" onClick={() => void templates.refetch()}>
          Повторить загрузку
        </Button>
      )}
      {templates.isPending && (
        <output className="mt-4 block text-sm">Загружаем шаблоны…</output>
      )}
      {templates.data?.length === 0 && (
        <p className="mt-4 text-sm">Шаблонов пока нет.</p>
      )}
      {TASK_STAGE_OPTIONS.map((stage) => (
        <fieldset
          key={stage.value}
          className="mt-5 grid gap-2"
          disabled={mutation.isPending}
        >
          <legend className="mb-2 font-bold">{stage.label}</legend>
          {templates.data
            ?.filter((template) => template.phase === stage.value)
            .map((template) => (
              <label
                htmlFor={`template-${template.id}`}
                key={template.id}
                className="flex min-h-11 items-start gap-3 rounded-md bg-[#EDF1E8] p-3"
              >
                <Checkbox
                  id={`template-${template.id}`}
                  className="mt-1"
                  aria-label={template.title}
                  checked={selected.includes(template.id)}
                  onCheckedChange={(checked) =>
                    setSelected((current) =>
                      checked
                        ? [...current, template.id]
                        : current.filter((id) => id !== template.id),
                    )
                  }
                />
                <span className="min-w-0 text-sm [overflow-wrap:anywhere]">
                  {template.title}
                  {project.tasks.some(
                    (task) =>
                      task.title.toLocaleLowerCase("ru") ===
                      template.title.toLocaleLowerCase("ru"),
                  ) && (
                    <span className="ml-2 text-xs text-[#68716C]">
                      Уже есть в плане
                    </span>
                  )}
                  {template.description && (
                    <span className="mt-1 block text-xs text-[#68716C]">
                      {template.description}
                    </span>
                  )}
                </span>
              </label>
            ))}
        </fieldset>
      ))}
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
          Отмена
        </Button>
        <Button
          disabled={!selected.length || mutation.isPending}
          loading={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          Добавить выбранные
        </Button>
      </div>
    </Modal>
  );
}
