import { Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { Field, Modal, TextInput } from "@/components/movermate/ui";
import { Button } from "@/components/ui/button";
import {
  type Project,
  type QrStrategy,
  rooms,
} from "@/configs/consts/movermate.const";

const selectClass =
  "h-11 rounded-[7px] bg-[#EDF1E8] px-3 text-sm hover:bg-[#E2E9DD] focus:bg-white focus:ring-3 focus:ring-[#42664D]/30";

export function BoxForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Modal className="max-w-md" label="Новая коробка" onClose={onClose}>
      <h2 className="text-2xl font-extrabold tracking-[-0.04em]">
        Новая коробка
      </h2>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <Field label="Краткое описание">
          <TextInput
            required
            name="title"
            placeholder="Посуда на первое время"
          />
        </Field>
        <Field label="Комната">
          <select name="room" className={selectClass}>
            {rooms.map((room) => (
              <option key={room.name}>{room.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Содержимое, через запятую">
          <TextInput name="items" placeholder="Кружки, тарелки, чайник" />
        </Field>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-bold">
          <input
            name="fragile"
            type="checkbox"
            className="size-4 accent-[#42664D]"
          />
          Хрупкое содержимое
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit">Создать</Button>
        </div>
      </form>
    </Modal>
  );
}

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
          <select name="stage" className={selectClass}>
            <option value="before">До переезда</option>
            <option value="moving">День переезда</option>
            <option value="after">После переезда</option>
          </select>
        </Field>
        <Field label="Ответственный">
          <TextInput name="assignee" placeholder="Необязательно" />
        </Field>
        <Field label="Срок">
          <TextInput name="due" placeholder="За 3 дня" />
        </Field>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit">Добавить</Button>
        </div>
      </form>
    </Modal>
  );
}

export function Settings({
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
          <select
            name="qrCodeStrategy"
            defaultValue={project.qrCodeStrategy}
            className={selectClass}
          >
            <option value="protected">Защищённый — вход по аккаунту</option>
            <option value="open">Открытый — вход по коду коробки</option>
          </select>
        </Field>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit">Сохранить</Button>
        </div>
      </form>
      {canDelete && (
        <div className="mt-6 rounded-xl bg-[#F9E8E2] p-4">
          <p className="text-sm font-bold text-[#A84D3C]">
            Удаление проекта необратимо: коробки, задачи и отметки будут
            потеряны.
          </p>
          <Button
            type="button"
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
