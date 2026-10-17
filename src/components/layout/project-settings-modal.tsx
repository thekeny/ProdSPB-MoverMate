import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { ApiError } from "@/api/request";
import { Button } from "@/components/ui/button";
import { ChipInput } from "@/components/ui/chip-input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TextInput } from "@/components/ui/text-input";
import type { QrStrategy } from "@/configs/types/box.type";
import type { Project } from "@/configs/types/project.type";
import { apiErrorMessage } from "@/lib/api-error";
import {
  getLocalDateInputMaxValue,
  getLocalDateInputValue,
} from "@/lib/date-time";
import {
  memberNameSchema,
  type ProjectSettingsFormValues,
  projectSettingsSchema,
  roomNameSchema,
} from "@/lib/forms/project.schema";

export function ProjectSettingsModal({
  project,
  canDelete,
  onClose,
  onSave,
  onDelete,
  onUpdateProject,
  onAddMember,
  onRemoveMember,
}: {
  project: Project;
  canDelete: boolean;
  onClose: () => void;
  onSave: (
    values: Pick<
      Project,
      "name" | "date" | "from" | "to" | "qrCodeStrategy"
    > & { reminderOffsetsDays: number[] },
  ) => Promise<void>;
  onDelete: () => Promise<void>;
  onUpdateProject: (apply: (project: Project) => Project) => void;
  onAddMember: (username: string) => Promise<void>;
  onRemoveMember: (userId: string, username: string) => Promise<void>;
}) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [memberRequestPending, setMemberRequestPending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [roomNotice, setRoomNotice] = useState<string | null>(null);
  const projectForm = useForm<ProjectSettingsFormValues>({
    resolver: zodResolver(projectSettingsSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: project.name,
      date: project.date,
      from: project.from,
      to: project.to,
      qrCodeStrategy: project.qrCodeStrategy,
      reminderOffsets: project.reminderOffsetsDays.map(String),
    },
  });
  const roomForm = useForm<{
    name: string;
    kind: "sourceRooms" | "destinationRooms";
  }>({
    resolver: zodResolver(
      roomNameSchema.extend({
        kind: z.enum(["sourceRooms", "destinationRooms"]),
      }),
    ),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { name: "", kind: "sourceRooms" },
  });
  const memberForm = useForm<{ name: string }>({
    resolver: zodResolver(memberNameSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { name: "" },
  });
  return (
    <Modal className="max-w-4xl" label="Настройки проекта" onClose={onClose}>
      <h2 className="text-2xl font-extrabold tracking-[-0.04em]">
        Настройки проекта
      </h2>
      <form
        noValidate
        onSubmit={projectForm.handleSubmit(async (values) => {
          setActionError(null);
          const reminderOffsetsDays = [
            ...new Set(values.reminderOffsets.map(Number)),
          ].sort((a, b) => b - a);
          try {
            await onSave({
              name: values.name.trim(),
              date: values.date,
              from: values.from.trim(),
              to: values.to.trim(),
              qrCodeStrategy: values.qrCodeStrategy as QrStrategy,
              reminderOffsetsDays: [...new Set(reminderOffsetsDays)].sort(
                (a, b) => b - a,
              ),
            });
          } catch (error) {
            setActionError(apiErrorMessage(error));
          }
        })}
        className="mt-6 grid gap-4"
      >
        <Field
          label="Название"
          error={projectForm.formState.errors.name?.message}
        >
          <TextInput {...projectForm.register("name")} />
        </Field>
        <Field
          label="Дата переезда"
          error={projectForm.formState.errors.date?.message}
        >
          <TextInput
            {...projectForm.register("date")}
            type="date"
            min={getLocalDateInputValue()}
            max={getLocalDateInputMaxValue()}
          />
        </Field>
        <Field label="Откуда">
          <TextInput {...projectForm.register("from")} />
        </Field>
        <Field label="Куда">
          <TextInput {...projectForm.register("to")} />
        </Field>
        <div className="grid gap-1.5">
          <span className="text-xs font-bold text-[#42664D]">
            Доступ по QR-коду
          </span>
          <Controller
            control={projectForm.control}
            name="qrCodeStrategy"
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <Switch
                  checked={field.value === "open"}
                  onCheckedChange={(checked) =>
                    field.onChange(checked ? "open" : "protected")
                  }
                  onBlur={field.onBlur}
                  aria-label="Разрешить просмотр по QR-коду всем, у кого есть ссылка"
                />
                <span className="text-sm text-[#68716C]">
                  {field.value === "open"
                    ? "Любой со ссылкой может посмотреть"
                    : "Только участники проекта"}
                </span>
              </div>
            )}
          />
        </div>
        <Field label="Напоминать за, дней">
          <Controller
            control={projectForm.control}
            name="reminderOffsets"
            render={({ field, fieldState }) => (
              <>
                <ChipInput
                  ariaLabel="Дни до переезда для напоминаний"
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Число, пробел или Enter"
                  inputMode="numeric"
                  ariaInvalid={fieldState.invalid}
                  ariaDescribedBy={
                    fieldState.error ? "reminder-offsets-error" : undefined
                  }
                  className="[&_input]:tabular-nums"
                />
                {fieldState.error && (
                  <p
                    id="reminder-offsets-error"
                    role="alert"
                    className="mt-1 text-xs text-[#A84D3C]"
                  >
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </Field>
        {actionError && (
          <p role="alert" className="text-sm text-[#A84D3C]">
            {actionError}
          </p>
        )}
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
                        setRoomNotice(
                          "Комната используется коробками или вещами. Сначала переместите их.",
                        );
                        return;
                      }
                      if (project[kind].length <= 1) {
                        setRoomNotice("Оставьте хотя бы одну комнату.");
                        return;
                      }
                      setRoomNotice(null);
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
          noValidate
          onSubmit={roomForm.handleSubmit(({ name: rawName, kind }) => {
            const name = rawName.trim();
            if (
              project[kind].some(
                (room) =>
                  room.toLocaleLowerCase("ru") === name.toLocaleLowerCase("ru"),
              )
            ) {
              roomForm.setError("name", { message: "Такая комната уже есть." });
              return;
            }
            onUpdateProject((current) => ({
              ...current,
              [kind]: [...current[kind], name],
            }));
            roomForm.reset({ name: "", kind });
          })}
        >
          <Controller
            control={roomForm.control}
            name="kind"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                items={[
                  { label: "Откуда", value: "sourceRooms" },
                  { label: "Куда", value: "destinationRooms" },
                ]}
              >
                <SelectTrigger aria-label="Тип комнаты" onBlur={field.onBlur}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sourceRooms">Откуда</SelectItem>
                  <SelectItem value="destinationRooms">Куда</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <TextInput
            {...roomForm.register("name")}
            aria-label="Название комнаты"
            aria-invalid={roomForm.formState.errors.name ? true : undefined}
            aria-describedby={
              roomForm.formState.errors.name ? "room-name-error" : undefined
            }
            placeholder="Новая комната"
            className="min-w-0 flex-1"
          />
          {roomForm.formState.errors.name && (
            <p
              id="room-name-error"
              role="alert"
              className="w-full text-xs text-[#A84D3C]"
            >
              {roomForm.formState.errors.name.message}
            </p>
          )}
          <Button type="submit" aria-label="Добавить комнату">
            <Plus />
          </Button>
        </form>
      </section>
      <section className="mt-6 border-t border-[#E8E2D5] pt-5">
        <h3 className="font-extrabold">Участники</h3>
        <p className="mt-1 text-xs text-[#68716C]">
          Участники проекта управляются на сервере.
        </p>
        <div className="mt-3 grid gap-2">
          {project.members.map((member) => (
            <div
              key={member}
              className="flex items-center justify-between rounded-md bg-[#EDF1E8] px-3 py-1 text-sm"
            >
              <span>
                {member}
                {project.collaborators.find(
                  (entry) => entry.username === member,
                )?.isOwner && (
                  <span className="ml-2 text-xs text-[#68716C]">Владелец</span>
                )}
              </span>
              {!project.collaborators.find((entry) => entry.username === member)
                ?.isOwner && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Удалить участника ${member}`}
                  onClick={async () => {
                    if (memberRequestPending) return;
                    setActionError(null);
                    const collaborator = project.collaborators.find(
                      (entry) => entry.username === member,
                    );
                    if (!collaborator) return;
                    setMemberRequestPending(true);
                    try {
                      await onRemoveMember(collaborator.userId, member);
                    } catch (error) {
                      setActionError(apiErrorMessage(error));
                    } finally {
                      setMemberRequestPending(false);
                    }
                  }}
                  disabled={memberRequestPending}
                >
                  <Trash2 className="size-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <form
          className="mt-3 flex gap-2"
          noValidate
          onSubmit={memberForm.handleSubmit(async ({ name: rawName }) => {
            if (memberRequestPending) return;
            const name = rawName.trim().toLowerCase();
            if (project.members.includes(name)) {
              memberForm.setError("name", {
                message: "Этот участник уже добавлен.",
              });
              return;
            }
            setActionError(null);
            setMemberRequestPending(true);
            try {
              await onAddMember(name);
              memberForm.reset({ name: "" });
            } catch (error) {
              if (
                error instanceof ApiError &&
                Object.values(error.fields).length
              )
                memberForm.setError("name", {
                  message: Object.values(error.fields)[0],
                });
              else setActionError(apiErrorMessage(error));
            } finally {
              setMemberRequestPending(false);
            }
          })}
        >
          <div className="grid min-w-0 flex-1 gap-1.5">
            <TextInput
              {...memberForm.register("name")}
              aria-label="Имя участника"
              aria-invalid={memberForm.formState.errors.name ? true : undefined}
              aria-describedby={
                memberForm.formState.errors.name
                  ? "member-name-error"
                  : undefined
              }
              placeholder="Имя пользователя"
            />
            {memberForm.formState.errors.name && (
              <p
                id="member-name-error"
                role="alert"
                className="text-xs text-[#A84D3C]"
              >
                {memberForm.formState.errors.name.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            aria-label="Добавить участника"
            disabled={memberRequestPending}
          >
            <Plus />
          </Button>
        </form>
      </section>
      {canDelete && (
        <div className="mt-6 border-t border-[#E8E2D5] pt-5">
          <h3 className="font-extrabold text-[#A84D3C]">Удалить проект</h3>
          <p className="mt-2 text-sm text-[#68716C]">
            Удаление проекта необратимо: коробки, задачи и отметки будут
            потеряны.
          </p>
          {deleteError && (
            <p
              role="alert"
              className="mt-4 rounded-md bg-[#F9E8E2] p-3 text-sm text-[#A84D3C]"
            >
              {deleteError}
            </p>
          )}
          <Button
            variant="destructive"
            className="mt-3"
            onClick={() => setConfirmDelete(true)}
            disabled={deletePending}
          >
            <Trash2 />
            Удалить проект
          </Button>
        </div>
      )}
      {roomNotice && (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[#F9E8E2] p-3 text-sm text-[#A84D3C]"
        >
          {roomNotice}
        </p>
      )}
      {confirmDelete && (
        <ConfirmDialog
          title={`Удалить проект «${project.name}»?`}
          description="Восстановить проект будет нельзя."
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => {
            setDeleteError(null);
            setDeletePending(true);
            void onDelete()
              .catch((error) => setDeleteError(apiErrorMessage(error)))
              .finally(() => setDeletePending(false));
          }}
        />
      )}
    </Modal>
  );
}
