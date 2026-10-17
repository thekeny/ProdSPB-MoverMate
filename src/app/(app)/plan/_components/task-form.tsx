import type { FormEvent } from "react";
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
import { TASK_STAGE_OPTIONS } from "@/configs/consts/task-stages.const";

export function TaskForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Modal className="max-w-md" label="Новая задача" onClose={onClose}>
      <h2 className="text-2xl font-extrabold tracking-[-0.04em]">
        Новая задача
      </h2>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <Field label="Задача">
          <TextInput name="title" required placeholder="Заказать грузчиков" />
        </Field>
        <Field label="Этап">
          <Select
            name="stage"
            defaultValue={TASK_STAGE_OPTIONS[0].value}
            items={TASK_STAGE_OPTIONS}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_STAGE_OPTIONS.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Ответственный">
          <TextInput name="assignee" placeholder="Необязательно" />
        </Field>
        <Field label="Срок">
          <TextInput name="due" placeholder="За 3 дня" />
        </Field>
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit">Добавить</Button>
        </div>
      </form>
    </Modal>
  );
}
