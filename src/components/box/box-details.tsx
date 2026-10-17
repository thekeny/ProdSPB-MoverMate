"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Link2, Pencil, Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { Modal } from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TextInput } from "@/components/ui/text-input";
import { statuses } from "@/configs/consts/statuses.const";
import type { Item, MoveBox } from "@/configs/types/box.type";
import type { Project } from "@/configs/types/project.type";
import { copyBoxLink } from "@/lib/box-link";
import { plural } from "@/lib/format";
import { boxEditSchema } from "@/lib/forms/project.schema";
import { uid } from "@/lib/id";
import { cn } from "@/lib/utils";

export function BoxDetails({
  box,
  project,
  onClose,
  updateProject,
  onDelete,
}: {
  box: MoveBox;
  project: Project;
  onClose: () => void;
  updateProject: (apply: (project: Project) => Project) => void;
  onDelete?: () => void;
}) {
  const fragileId = useId();
  const [editing, setEditing] = useState(false);
  const [confirmBox, setConfirmBox] = useState(false);
  const [removingItem, setRemovingItem] = useState<Item | null>(null);
  const [copied, setCopied] = useState(false);
  const addItemForm = useForm<{ name: string }>({
    resolver: zodResolver(
      z.object({
        name: z.string().trim().min(1, "Введите название вещи."),
      }),
    ),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { name: "" },
  });
  const editForm = useForm<{ title: string; room: string; fragile: boolean }>({
    resolver: zodResolver(boxEditSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { title: box.title, room: box.room, fragile: box.fragile },
  });
  const contents = project.items.filter(
    (item) => item.boxId === box.id && item.state === "IN_BOX",
  );
  const currentIndex = statuses.findIndex((item) => item.key === box.status);
  const updateBox = (apply: (box: MoveBox) => MoveBox) =>
    updateProject((current) => ({
      ...current,
      boxes: current.boxes.map((entry) =>
        entry.id === box.id ? apply(entry) : entry,
      ),
    }));
  const changeItem = (id: string, state: "TAKEN_OUT" | "LOST") =>
    updateProject((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === id ? { ...item, state, boxId: null } : item,
      ),
    }));

  return (
    <Modal
      className="max-w-2xl"
      label={`Коробка № ${box.number}`}
      onClose={onClose}
    >
      <div className="pr-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-[#1D2923] px-2 py-1 font-mono text-xs font-bold text-[#F4F1E9]">
            № {box.number}
          </span>
          <span className="rounded-full bg-[#EDF1E8] px-2 py-1 text-[10px] font-bold text-[#42664D]">
            {box.room}
          </span>
          {box.fragile && (
            <span className="rounded-full bg-[#F9E8E2] px-2 py-1 text-[10px] font-bold text-[#A84D3C]">
              Хрупкое
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label={copied ? "Ссылка скопирована" : "Скопировать ссылку"}
            onClick={() => {
              void copyBoxLink(box.qrToken).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              });
            }}
          >
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Link2 className="size-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditing(true)}
            aria-label="Редактировать коробку"
          >
            <Pencil className="size-4" />
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Удалить коробку"
              onClick={() => setConfirmBox(true)}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
        <h2 className="mt-4 text-2xl font-extrabold">{box.title}</h2>
      </div>
      <section className="mt-6 rounded-[10px] bg-[#EDF1E8] p-4">
        <p className="text-xs font-bold text-[#42664D]">Статус коробки</p>
        <div className="mt-3 grid grid-cols-5 gap-1">
          {statuses.map((item, index) => (
            <Button
              variant="ghost"
              key={item.key}
              disabled={Math.abs(currentIndex - index) > 1}
              onClick={() =>
                updateBox((current) => ({ ...current, status: item.key }))
              }
              className={cn(
                "h-auto min-w-0 rounded-md px-1 py-2.5 text-[9px] font-extrabold whitespace-normal sm:text-[10px]",
                item.key === box.status
                  ? "bg-[#1D2923] text-[#F4F1E9]"
                  : "bg-white text-[#42664D]",
              )}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </section>
      <section className="mt-6">
        <h3 className="font-extrabold">
          В коробке {contents.length}{" "}
          {plural(contents.length, ["вещь", "вещи", "вещей"])}
        </h3>
        <form
          className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]"
          noValidate
          onSubmit={addItemForm.handleSubmit(({ name }) => {
            updateProject((current) => ({
              ...current,
              items: [
                ...current.items,
                {
                  id: uid("item"),
                  name: name.trim(),
                  state: "IN_BOX",
                  sourceRoom: box.room,
                  boxId: box.id,
                  quantity: 1,
                  priority: "NORMAL",
                },
              ],
            }));
            addItemForm.reset({ name: "" });
          })}
        >
          <TextInput
            {...addItemForm.register("name")}
            placeholder="Добавить вещь"
            aria-label="Название вещи"
            aria-invalid={addItemForm.formState.errors.name ? true : undefined}
            aria-describedby={
              addItemForm.formState.errors.name ? "box-item-error" : undefined
            }
          />
          <FormError errors={addItemForm.formState.errors} />
          <Button type="submit" variant="outline">
            <Plus />
            Добавить
          </Button>
        </form>
        <div className="mt-3 grid gap-2">
          {contents.length ? (
            contents.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-2 rounded-md bg-[#F5F3EE] p-3"
              >
                <span className="min-w-0 flex-1 text-sm font-medium">
                  {item.name}
                  {item.quantity > 1 ? ` · ${item.quantity} шт.` : ""}
                </span>
                <Checkbox
                  aria-label={`Первая необходимость: ${item.name}`}
                  checked={item.priority === "FIRST_NECESSITY"}
                  onCheckedChange={() =>
                    updateProject((current) => ({
                      ...current,
                      items: current.items.map((entry) =>
                        entry.id === item.id
                          ? {
                              ...entry,
                              priority:
                                entry.priority === "FIRST_NECESSITY"
                                  ? "NORMAL"
                                  : "FIRST_NECESSITY",
                            }
                          : entry,
                      ),
                    }))
                  }
                />
                <span className="text-xs text-[#68716C]">Первый день</span>
                <Button
                  variant="ghost"
                  className="text-xs"
                  onClick={() => changeItem(item.id, "TAKEN_OUT")}
                >
                  Вынута
                </Button>
                <Button
                  variant="ghost"
                  className="text-xs text-[#A84D3C]"
                  onClick={() => changeItem(item.id, "LOST")}
                >
                  Потерялась
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Удалить ${item.name}`}
                  onClick={() => setRemovingItem(item)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="rounded-md bg-[#F5F3EE] p-5 text-center text-sm text-[#68716C]">
              Список пуст.
            </p>
          )}
        </div>
      </section>
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose}>
          Готово <Check />
        </Button>
      </div>
      {editing && (
        <Modal
          className="max-w-xl"
          label="Редактировать коробку"
          onClose={() => setEditing(false)}
        >
          <h2 className="text-2xl font-extrabold">Редактировать коробку</h2>
          <form
            className="mt-6 grid gap-4"
            noValidate
            onSubmit={editForm.handleSubmit(({ title, room, fragile }) => {
              updateBox((current) => ({
                ...current,
                title: title.trim(),
                room,
                fragile,
              }));
              setEditing(false);
            })}
          >
            <Field
              label="Краткое описание"
              error={editForm.formState.errors.title?.message}
            >
              <TextInput {...editForm.register("title")} />
            </Field>
            <Field label="Куда">
              <Controller
                control={editForm.control}
                name="room"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    items={project.destinationRooms.map((room) => ({
                      label: room,
                      value: room,
                    }))}
                  >
                    <SelectTrigger onBlur={field.onBlur}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {project.destinationRooms.map((room) => (
                        <SelectItem key={room} value={room}>
                          {room}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <label
              htmlFor={fragileId}
              className="flex items-center gap-2 text-sm font-bold"
            >
              <Controller
                control={editForm.control}
                name="fragile"
                render={({ field }) => (
                  <Checkbox
                    id={fragileId}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              Хрупкое
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Отмена
              </Button>
              <Button type="submit">Сохранить</Button>
            </div>
          </form>
        </Modal>
      )}
      {confirmBox && onDelete && (
        <ConfirmDialog
          title={`Удалить коробку № ${box.number}?`}
          description={`Вместе с ней удалятся ${contents.length} ${plural(contents.length, ["вещь", "вещи", "вещей"])}.`}
          onClose={() => setConfirmBox(false)}
          onConfirm={onDelete}
        />
      )}
      {removingItem && (
        <ConfirmDialog
          title={`Удалить вещь «${removingItem.name}»?`}
          onClose={() => setRemovingItem(null)}
          onConfirm={() =>
            updateProject((current) => ({
              ...current,
              items: current.items.filter(
                (entry) => entry.id !== removingItem.id,
              ),
            }))
          }
        />
      )}
    </Modal>
  );
}
