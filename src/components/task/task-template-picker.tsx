import { useEffect, useRef } from "react";
import { ApiQueryError } from "@/components/ui/api-query-error";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TASK_STAGE_OPTIONS } from "@/configs/consts/task-stages.const";
import { useTaskTemplates } from "@/lib/use-task-templates";

export function TaskTemplatePicker({
  value,
  onChange,
  disabled = false,
  selectAllByDefault = false,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  selectAllByDefault?: boolean;
}) {
  const templates = useTaskTemplates();
  const initialized = useRef(false);
  const ids = templates.data?.map((template) => template.id) ?? [];

  useEffect(() => {
    if (!selectAllByDefault || !templates.data || initialized.current) return;
    initialized.current = true;
    if (!templates.data.length) return;
    onChange(templates.data.map((template) => template.id));
  }, [onChange, selectAllByDefault, templates.data]);

  const allSelected = ids.length > 0 && ids.every((id) => value.includes(id));

  return (
    <div className="grid gap-3">
      <ApiQueryError error={templates.error} />
      {templates.isError && (
        <Button
          variant="outline"
          className="justify-self-start"
          onClick={() => void templates.refetch()}
        >
          Повторить загрузку
        </Button>
      )}
      {templates.isPending && (
        <output className="text-sm text-[#5C6560]">Загружаем шаблоны…</output>
      )}
      {templates.data?.length === 0 && (
        <p className="text-sm text-[#5C6560]">Шаблонов пока нет.</p>
      )}
      {ids.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-[#5C6560]">
              Выбрано {value.length} из {ids.length}
            </p>
            <Button
              variant="ghost"
              size="xs"
              type="button"
              disabled={disabled}
              onClick={() => onChange(allSelected ? [] : ids)}
              className="h-auto p-0 text-xs font-bold text-[#42664D] hover:bg-transparent hover:text-[#1D2923]"
            >
              {allSelected ? "Снять выделение" : "Выбрать все"}
            </Button>
          </div>
          {TASK_STAGE_OPTIONS.map((stage) => {
            const stageTemplates =
              templates.data?.filter(
                (template) => template.phase === stage.value,
              ) ?? [];
            if (!stageTemplates.length) return null;
            return (
              <fieldset
                key={stage.value}
                className="grid gap-2"
                disabled={disabled}
              >
                <legend className="mb-1 font-bold">{stage.label}</legend>
                {stageTemplates.map((template) => (
                  <label
                    htmlFor={`template-${template.id}`}
                    key={template.id}
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md bg-[#EDF1E8] p-3"
                  >
                    <Checkbox
                      id={`template-${template.id}`}
                      className="mt-1"
                      aria-label={template.title}
                      checked={value.includes(template.id)}
                      onCheckedChange={(checked) =>
                        onChange(
                          checked
                            ? [...value, template.id]
                            : value.filter((id) => id !== template.id),
                        )
                      }
                    />
                    <span className="min-w-0 text-sm [overflow-wrap:anywhere]">
                      {template.title}
                      {template.description && (
                        <span className="mt-1 block text-xs text-[#5C6560]">
                          {template.description}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </fieldset>
            );
          })}
        </>
      )}
    </div>
  );
}
