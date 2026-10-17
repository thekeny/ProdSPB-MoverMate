"use client";

import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Field, Modal, TextInput } from "@/components/movermate/ui";
import { Button } from "@/components/ui/button";
import {
  type MoveBox,
  rooms,
  statuses,
  uid,
} from "@/configs/consts/movermate.const";
import { cn } from "@/lib/utils";

export function BoxDetails({
  box,
  onClose,
  update,
  onDelete,
}: {
  box: MoveBox;
  onClose: () => void;
  update: (apply: (box: MoveBox) => MoveBox) => void;
  onDelete?: () => void;
}) {
  const [newItem, setNewItem] = useState("");
  const [editing, setEditing] = useState(false);
  const currentIndex = Math.max(
    0,
    statuses.findIndex((item) => item.key === box.status),
  );
  return (
    <Modal className="max-w-2xl" label={`Коробка ${box.id}`} onClose={onClose}>
      <div className="pr-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-[#1D2923] px-2 py-1 font-mono text-xs font-bold text-[#F4F1E9]">
            {box.id}
          </span>
          <span className="rounded-full bg-[#EDF1E8] px-2 py-1 text-[10px] font-bold text-[#42664D]">
            {box.room}
          </span>
          {box.fragile && (
            <span className="rounded-full bg-[#F9E8E2] px-2 py-1 text-[10px] font-bold text-[#A84D3C]">
              Хрупкое
            </span>
          )}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="grid size-8 place-items-center rounded-md text-[#68716C] transition-colors hover:bg-[#EDF1E8] hover:text-[#1D2923]"
            aria-label="Редактировать коробку"
          >
            <Pencil className="size-4" />
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Удалить коробку «${box.title}»?`))
                  onDelete();
              }}
              className="grid size-8 place-items-center rounded-md text-[#68716C] transition-colors hover:bg-[#F9E8E2] hover:text-[#A84D3C]"
              aria-label="Удалить коробку"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
        <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.04em]">
          {box.title}
        </h2>
      </div>
      <section className="mt-6 rounded-xl bg-[#EDF1E8] p-4">
        <p className="text-xs font-bold text-[#42664D]">Статус коробки</p>
        <div className="mt-3 grid grid-cols-5 gap-1">
          {statuses.map((item, index) => (
            <button
              type="button"
              key={item.key}
              disabled={Math.abs(currentIndex - index) > 1}
              onClick={() =>
                update((current) => ({ ...current, status: item.key }))
              }
              className={cn(
                "rounded-md px-1 py-2.5 text-[9px] font-extrabold sm:text-[10px]",
                item.key === box.status
                  ? "bg-[#1D2923] text-[#F4F1E9]"
                  : Math.abs(currentIndex - index) <= 1
                    ? "bg-white text-[#42664D] hover:bg-[#E8E2D5]"
                    : "cursor-not-allowed text-[#9BA69F]",
              )}
              title={
                Math.abs(currentIndex - index) > 1
                  ? "Статусы меняются по порядку"
                  : undefined
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold">Содержимое</h3>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-[#42664D]">
            <input
              type="checkbox"
              checked={box.deferred}
              onChange={() =>
                update((current) => ({
                  ...current,
                  deferred: !current.deferred,
                }))
              }
              className="size-4 accent-[#42664D]"
            />
            Заполнить позже
          </label>
        </div>
        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            const name = newItem.trim();
            if (!name) return;
            update((current) => ({
              ...current,
              deferred: false,
              items: [
                ...current.items,
                { id: uid("item"), name, unpacked: false, lost: false },
              ],
            }));
            setNewItem("");
          }}
        >
          <input
            value={newItem}
            onChange={(event) => setNewItem(event.target.value)}
            placeholder="Добавить вещь"
            aria-label="Название вещи"
            className="h-11 min-w-0 flex-1 rounded-[7px] bg-[#EDF1E8] px-3 text-sm outline-none placeholder:text-[#68716C] hover:bg-[#E2E9DD] focus:bg-white focus:ring-3 focus:ring-[#42664D]/30"
          />
          <Button type="submit" variant="outline" className="h-11 sm:shrink-0">
            <Plus />
            Добавить
          </Button>
        </form>
        <div className="mt-3 grid gap-2">
          {box.items.length ? (
            box.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl bg-[#F5F3EE] p-3"
              >
                <input
                  type="checkbox"
                  checked={item.unpacked}
                  disabled={currentIndex < 3}
                  onChange={() =>
                    update((current) => ({
                      ...current,
                      items: current.items.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, unpacked: !entry.unpacked, lost: false }
                          : entry,
                      ),
                    }))
                  }
                  className="size-4 accent-[#42664D]"
                  aria-label={`Распаковано: ${item.name}`}
                />
                <span
                  className={cn(
                    "min-w-0 flex-1 text-sm font-medium",
                    item.unpacked && "text-[#68716C] line-through",
                  )}
                >
                  {item.name}
                </span>
                <button
                  type="button"
                  aria-label={`${item.lost ? "Отметить найденной" : "Отметить потерянной"}: ${item.name}`}
                  onClick={() =>
                    update((current) => ({
                      ...current,
                      items: current.items.map((entry) =>
                        entry.id === item.id
                          ? {
                              ...entry,
                              lost: !entry.lost,
                              unpacked: entry.lost ? entry.unpacked : false,
                            }
                          : entry,
                      ),
                    }))
                  }
                  className={cn(
                    "rounded-md px-2 py-1.5 text-[10px] font-bold transition-colors",
                    item.lost
                      ? "bg-[#A84D3C] text-white"
                      : "bg-[#F9E8E2] text-[#A84D3C] hover:bg-[#F3D9CE]",
                  )}
                >
                  {item.lost ? "Нашлась" : "Потерялась?"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Удалить вещь «${item.name}»?`))
                      update((current) => ({
                        ...current,
                        items: current.items.filter(
                          (entry) => entry.id !== item.id,
                        ),
                      }));
                  }}
                  className="grid size-8 place-items-center rounded-md text-[#68716C] transition-colors hover:bg-[#E8E2D5] hover:text-[#A84D3C]"
                  aria-label={`Удалить ${item.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="rounded-xl bg-[#F5F3EE] p-5 text-center text-sm text-[#68716C]">
              Список пуст — добавьте вещи выше.
            </p>
          )}
        </div>
      </section>
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose}>
          Готово
          <Check />
        </Button>
      </div>
      {editing && (
        <Modal
          className="max-w-md"
          label="Редактировать коробку"
          onClose={() => setEditing(false)}
        >
          <h2 className="text-2xl font-extrabold tracking-[-0.04em]">
            Редактировать коробку
          </h2>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const title = String(data.get("title") ?? "").trim();
              if (!title) return;
              update((current) => ({
                ...current,
                title,
                room: (data.get("room") as MoveBox["room"]) ?? current.room,
                fragile: data.get("fragile") === "on",
              }));
              setEditing(false);
            }}
            className="mt-6 grid gap-4"
          >
            <Field label="Краткое описание">
              <TextInput name="title" required defaultValue={box.title} />
            </Field>
            <Field label="Комната">
              <select
                name="room"
                defaultValue={box.room}
                className="h-11 rounded-[7px] bg-[#EDF1E8] px-3 text-sm hover:bg-[#E2E9DD] focus:bg-white focus:ring-3 focus:ring-[#42664D]/30"
              >
                {rooms.map((room) => (
                  <option key={room.name}>{room.name}</option>
                ))}
              </select>
            </Field>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold">
              <input
                name="fragile"
                type="checkbox"
                defaultChecked={box.fragile}
                className="size-4 accent-[#42664D]"
              />
              Хрупкое содержимое
            </label>
            <div className="mt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditing(false)}
              >
                Отмена
              </Button>
              <Button type="submit">Сохранить</Button>
            </div>
          </form>
        </Modal>
      )}
    </Modal>
  );
}
