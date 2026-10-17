import type { FormEvent } from "react";
import { TaskFields } from "@/app/(app)/plan/_components/task-fields";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function TaskForm({
  onClose,
  onSubmit,
  members,
}: {
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  members: string[];
}) {
  return (
    <Modal className="max-w-md" label="Новая задача" onClose={onClose}>
      <h2 className="text-2xl font-extrabold tracking-[-0.04em]">
        Новая задача
      </h2>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <TaskFields members={members} />
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
