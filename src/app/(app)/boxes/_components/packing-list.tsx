import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ItemScanModal } from "@/app/(app)/boxes/_components/item-scan-modal";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TextInput } from "@/components/ui/text-input";
import { ITEM_PRIORITY_OPTIONS } from "@/configs/consts/item-priorities.const";
import { LIST_PAGE_SIZE } from "@/configs/consts/lists.const";
import type { Item } from "@/configs/types/box.type";
import type { Project } from "@/configs/types/project.type";
import {
  type PackingItemFormValues,
  packingItemSchema,
} from "@/lib/forms/project.schema";
import { uid } from "@/lib/id";

export function PackingList({
  project,
  updateProject,
  canEdit,
}: {
  project: Project;
  canEdit: boolean;
  updateProject: (apply: (project: Project) => Project) => void;
}) {
  const [removing, setRemoving] = useState<Item | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [limit, setLimit] = useState(LIST_PAGE_SIZE);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PackingItemFormValues>({
    resolver: zodResolver(packingItemSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      room: project.lastSourceRoom || project.sourceRooms[0] || "",
      priority: "NORMAL",
      quantity: 1,
    },
  });
  const pending = project.items
    .filter((item) => item.state === "TO_PACK")
    .sort(
      (a, b) =>
        Number(b.priority === "FIRST_NECESSITY") -
          Number(a.priority === "FIRST_NECESSITY") ||
        a.name.localeCompare(b.name, "ru") ||
        a.id.localeCompare(b.id),
    );
  return (
    <section className="mt-6 rounded-lg bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold">Упаковать</h2>
        {canEdit && (
          <Button variant="outline" onClick={() => setScanOpen(true)}>
            <Camera />
            Добавить по фото
          </Button>
        )}
      </div>
      {scanOpen && canEdit && (
        <ItemScanModal
          projectId={project.id}
          submitLabel="Добавить в список"
          placement={{
            sourceRooms: project.sourceRooms,
            defaultRoom: project.lastSourceRoom || project.sourceRooms[0] || "",
          }}
          onClose={() => setScanOpen(false)}
          onSubmit={({ room, priority, items }) =>
            updateProject((current) => ({
              ...current,
              lastSourceRoom: room,
              items: [
                ...current.items,
                ...items.map(({ name, quantity }) => ({
                  id: uid("item"),
                  name,
                  state: "TO_PACK" as const,
                  sourceRoom: room,
                  boxId: null,
                  quantity,
                  priority,
                })),
              ],
            }))
          }
        />
      )}
      {canEdit && (
        <form
          className="mt-4 grid gap-2 lg:grid-cols-[minmax(0,1fr)_8rem_9rem_5rem_auto]"
          noValidate
          onSubmit={handleSubmit(({ name, room, priority, quantity }) => {
            updateProject((current) => ({
              ...current,
              lastSourceRoom: room,
              items: [
                ...current.items,
                {
                  id: uid("item"),
                  name: name.trim(),
                  state: "TO_PACK",
                  sourceRoom: room,
                  boxId: null,
                  quantity,
                  priority,
                },
              ],
            }));
            reset({ name: "", room, priority, quantity: 1 });
          })}
        >
          <TextInput
            {...register("name")}
            maxLength={100}
            placeholder="Название вещи"
            aria-label="Название вещи"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "packing-name-error" : undefined}
          />
          {errors.name && (
            <p
              id="packing-name-error"
              className="text-xs text-[#A84D3C] lg:col-span-full"
              role="alert"
            >
              {errors.name.message}
            </p>
          )}
          <Controller
            control={control}
            name="room"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                items={project.sourceRooms.map((entry) => ({
                  label: entry,
                  value: entry,
                }))}
              >
                <SelectTrigger
                  aria-label="Исходная комната"
                  onBlur={field.onBlur}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {project.sourceRooms.map((entry) => (
                    <SelectItem key={entry} value={entry}>
                      {entry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                items={ITEM_PRIORITY_OPTIONS}
              >
                <SelectTrigger aria-label="Приоритет" onBlur={field.onBlur}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <TextInput
            {...register("quantity", { valueAsNumber: true })}
            type="number"
            min={1}
            max={9999}
            step={1}
            aria-label="Количество"
            aria-invalid={errors.quantity ? true : undefined}
            aria-describedby={
              errors.quantity ? "packing-quantity-error" : undefined
            }
            className="w-full sm:col-span-1"
          />
          {errors.quantity && (
            <p
              id="packing-quantity-error"
              className="text-xs text-[#A84D3C]"
              role="alert"
            >
              {errors.quantity.message}
            </p>
          )}
          <Button type="submit">Добавить</Button>
        </form>
      )}
      <div className="mt-4 grid gap-2">
        {pending.length ? (
          pending.slice(0, limit).map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-start gap-2 rounded-md bg-[#F5F3EE] p-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
            >
              <span className="w-full min-w-0 sm:w-auto sm:flex-1">
                <strong className="[overflow-wrap:anywhere]">
                  {item.name}
                </strong>
                <span className="ml-2 text-[#5C6560]">
                  {item.quantity > 1 ? `${item.quantity} шт. · ` : ""}
                  {item.sourceRoom}
                  {item.priority === "FIRST_NECESSITY" ? " · Первый день" : ""}
                </span>
              </span>
              {canEdit && (
                <Select
                  aria-label={`Коробка для ${item.name}`}
                  value={null}
                  onValueChange={(boxId) => {
                    if (!boxId) return;
                    updateProject((current) => ({
                      ...current,
                      boxes: current.boxes.map((box) =>
                        box.id === boxId &&
                        !box.sourceRooms.includes(item.sourceRoom)
                          ? {
                              ...box,
                              sourceRooms: [
                                ...box.sourceRooms,
                                item.sourceRoom,
                              ],
                            }
                          : box,
                      ),
                      items: current.items.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, state: "IN_BOX", boxId }
                          : entry,
                      ),
                    }));
                  }}
                  items={project.boxes.map((box) => ({
                    label: `№ ${box.number} · ${box.title}`,
                    value: box.id,
                  }))}
                >
                  <SelectTrigger
                    className="h-10 w-auto min-w-40 px-2 text-xs"
                    aria-label="Положить в коробку"
                  >
                    <SelectValue placeholder="Положить в коробку" />
                  </SelectTrigger>
                  <SelectContent>
                    {project.boxes.map((box) => (
                      <SelectItem key={box.id} value={box.id}>
                        № {box.number} · {box.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Удалить ${item.name}`}
                  onClick={() => setRemoving(item)}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-[#5C6560]">Вещей для упаковки пока нет.</p>
        )}
      </div>
      {pending.length > limit && (
        <Button
          variant="outline"
          className="mt-3"
          onClick={() => setLimit((current) => current + LIST_PAGE_SIZE)}
        >
          Ещё вещи · показано {limit} из {pending.length}
        </Button>
      )}
      {removing && canEdit && (
        <ConfirmDialog
          title={`Удалить вещь «${removing.name}»?`}
          onClose={() => setRemoving(null)}
          onConfirm={() =>
            updateProject((current) => ({
              ...current,
              items: current.items.filter((entry) => entry.id !== removing.id),
            }))
          }
        />
      )}
    </section>
  );
}
