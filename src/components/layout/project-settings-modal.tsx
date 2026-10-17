import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TextInput } from "@/components/ui/text-input";
import { QR_STRATEGY_OPTIONS } from "@/configs/consts/qr-strategies.const";
import type { QrStrategy } from "@/configs/types/box.type";
import type { Project } from "@/configs/types/project.type";

export function ProjectSettingsModal({
  project,
  canDelete,
  onClose,
  onSave,
  onDelete,
}: {
  project: Project;
  canDelete: boolean;
  onClose: () => void;
  onSave: (
    values: Pick<Project, "name" | "date" | "from" | "to" | "qrCodeStrategy">,
  ) => void;
  onDelete: () => void;
}) {
  return (
    <Modal className="max-w-md" label="Настройки проекта" onClose={onClose}>
      <h2 className="text-2xl font-extrabold tracking-[-0.04em]">
        Настройки проекта
      </h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const name = String(data.get("name") ?? "").trim();
          const date = String(data.get("date") ?? "").trim();
          if (!name || !date) return;
          onSave({
            name,
            date,
            from: String(data.get("from") ?? "").trim(),
            to: String(data.get("to") ?? "").trim(),
            qrCodeStrategy:
              (data.get("qrCodeStrategy") as QrStrategy) ?? "protected",
          });
        }}
        className="mt-6 grid gap-4"
      >
        <Field label="Название">
          <TextInput name="name" required defaultValue={project.name} />
        </Field>
        <Field label="Дата переезда">
          <TextInput
            name="date"
            type="date"
            required
            defaultValue={project.date}
          />
        </Field>
        <Field label="Откуда">
          <TextInput name="from" defaultValue={project.from} />
        </Field>
        <Field label="Куда">
          <TextInput name="to" defaultValue={project.to} />
        </Field>
        <Field label="Доступ по QR-коду">
          <Select
            name="qrCodeStrategy"
            defaultValue={project.qrCodeStrategy}
            items={QR_STRATEGY_OPTIONS}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QR_STRATEGY_OPTIONS.map((strategy) => (
                <SelectItem key={strategy.value} value={strategy.value}>
                  {strategy.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit">Сохранить</Button>
        </div>
      </form>
      {canDelete && (
        <div className="mt-6 rounded-[8px] bg-[#F9E8E2] p-4">
          <p className="text-sm font-bold text-[#A84D3C]">
            Удаление проекта необратимо: коробки, задачи и отметки будут
            потеряны.
          </p>
          <Button
            variant="destructive"
            className="mt-3"
            onClick={() => {
              if (
                window.confirm(
                  `Удалить проект «${project.name}» без возможности восстановления?`,
                )
              )
                onDelete();
            }}
          >
            <Trash2 />
            Удалить проект
          </Button>
        </div>
      )}
    </Modal>
  );
}
