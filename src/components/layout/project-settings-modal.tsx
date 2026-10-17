import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
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
  onUpdateProject,
  ownerUsername,
}: {
  project: Project;
  canDelete: boolean;
  onClose: () => void;
  onSave: (
    values: Pick<Project, "name" | "date" | "from" | "to" | "qrCodeStrategy">,
  ) => void;
  onDelete: () => void;
  onUpdateProject: (apply: (project: Project) => Project) => void;
  ownerUsername: string;
}) {
  const [roomName, setRoomName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [roomKind, setRoomKind] = useState<"sourceRooms" | "destinationRooms">(
    "sourceRooms",
  );
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
        <p className="text-xs text-[#68716C]">
          Данные проекта хранятся в браузере: QR пока работает только на этом
          устройстве; для защищённого QR участник должен войти в аккаунт.
        </p>
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit">Сохранить</Button>
        </div>
      </form>
      <section className="mt-6 border-t border-[#E8E2D5] pt-5">
        <h3 className="font-extrabold">Комнаты</h3>
        {(["sourceRooms", "destinationRooms"] as const).map((kind) => (
          <div key={kind} className="mt-4">
            <h4 className="text-xs font-bold text-[#42664D]">
              {kind === "sourceRooms" ? "Откуда" : "Куда"}
            </h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {project[kind].map((room) => (
                <span
                  key={room}
                  className="inline-flex items-center gap-1 rounded-md bg-[#EDF1E8] px-2 py-1 text-xs"
                >
                  {room}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Удалить комнату ${room}`}
                    onClick={() => {
                      const inUse =
                        kind === "sourceRooms"
                          ? project.items.some(
                              (item) => item.sourceRoom === room,
                            ) ||
                            project.boxes.some((box) =>
                              box.sourceRooms.includes(room),
                            )
                          : project.boxes.some((box) => box.room === room);
                      if (inUse) {
                        window.alert(
                          "Комната используется коробками или вещами. Сначала переместите их.",
                        );
                        return;
                      }
                      if (project[kind].length <= 1) {
                        window.alert("Оставьте хотя бы одну комнату.");
                        return;
                      }
                      onUpdateProject((current) => ({
                        ...current,
                        [kind]: current[kind].filter((name) => name !== room),
                        ...(kind === "sourceRooms" &&
                        current.lastSourceRoom === room
                          ? {
                              lastSourceRoom:
                                current.sourceRooms.find(
                                  (name) => name !== room,
                                ) ?? "",
                            }
                          : {}),
                      }));
                    }}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </span>
              ))}
            </div>
          </div>
        ))}
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const name = roomName.trim();
            if (
              !name ||
              project[roomKind].some(
                (room) =>
                  room.toLocaleLowerCase("ru") === name.toLocaleLowerCase("ru"),
              )
            )
              return;
            onUpdateProject((current) => ({
              ...current,
              [roomKind]: [...current[roomKind], name],
            }));
            setRoomName("");
          }}
        >
          <Select
            value={roomKind}
            onValueChange={(value) =>
              value && setRoomKind(value as typeof roomKind)
            }
            items={[
              { label: "Откуда", value: "sourceRooms" },
              { label: "Куда", value: "destinationRooms" },
            ]}
          >
            <SelectTrigger aria-label="Тип комнаты">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sourceRooms">Откуда</SelectItem>
              <SelectItem value="destinationRooms">Куда</SelectItem>
            </SelectContent>
          </Select>
          <TextInput
            aria-label="Название комнаты"
            value={roomName}
            onChange={(event) => setRoomName(event.target.value)}
            placeholder="Новая комната"
            className="min-w-0 flex-1"
          />
          <Button type="submit" aria-label="Добавить комнату">
            <Plus />
          </Button>
        </form>
      </section>
      <section className="mt-6 border-t border-[#E8E2D5] pt-5">
        <h3 className="font-extrabold">Участники</h3>
        <p className="mt-1 text-xs text-[#68716C]">
          Список хранится локально. Добавленные имена пока не проверяются на
          сервере.
        </p>
        <div className="mt-3 grid gap-2">
          {project.members.map((member) => (
            <div
              key={member}
              className="flex items-center justify-between rounded-md bg-[#EDF1E8] px-3 py-1 text-sm"
            >
              <span>
                {member}
                {member === ownerUsername && (
                  <span className="ml-2 text-xs text-[#68716C]">Владелец</span>
                )}
              </span>
              {member !== ownerUsername && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Удалить участника ${member}`}
                  onClick={() =>
                    onUpdateProject((current) => ({
                      ...current,
                      members: current.members.filter(
                        (name) => name !== member,
                      ),
                      tasks: current.tasks.map((task) => ({
                        ...task,
                        assignees: task.assignees.filter(
                          (name) => name !== member,
                        ),
                      })),
                    }))
                  }
                >
                  <Trash2 className="size-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const name = memberName.trim().toLowerCase();
            if (!name || project.members.includes(name)) return;
            onUpdateProject((current) => ({
              ...current,
              members: [...current.members, name],
            }));
            setMemberName("");
          }}
        >
          <TextInput
            aria-label="Имя участника"
            value={memberName}
            onChange={(event) => setMemberName(event.target.value)}
            placeholder="Имя пользователя"
            className="min-w-0 flex-1"
          />
          <Button type="submit" aria-label="Добавить участника">
            <Plus />
          </Button>
        </form>
      </section>
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
