import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TextInput } from "@/components/ui/text-input";
import type { Project } from "@/configs/types/project.type";
import { uid } from "@/lib/id";

export function PackingList({
  project,
  updateProject,
}: {
  project: Project;
  updateProject: (apply: (project: Project) => Project) => void;
}) {
  const [name, setName] = useState("");
  const [room, setRoom] = useState(project.lastSourceRoom);
  const [priority, setPriority] = useState<"NORMAL" | "FIRST_NECESSITY">(
    "NORMAL",
  );
  const [quantity, setQuantity] = useState(1);
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
      <h2 className="text-lg font-extrabold">Упаковать</h2>
      <form
        className="mt-4 grid gap-2 lg:grid-cols-[minmax(0,1fr)_8rem_9rem_5rem_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
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
          setName("");
          setQuantity(1);
        }}
      >
        <TextInput
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Название вещи"
          aria-label="Название вещи"
        />
        <Select
          value={room}
          onValueChange={(value) => setRoom(value ?? "")}
          items={project.sourceRooms.map((entry) => ({
            label: entry,
            value: entry,
          }))}
        >
          <SelectTrigger aria-label="Исходная комната">
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
        <Select
          value={priority}
          onValueChange={(value) => setPriority(value as typeof priority)}
          items={[
            { label: "Обычная", value: "NORMAL" },
            { label: "Первый день", value: "FIRST_NECESSITY" },
          ]}
        >
          <SelectTrigger aria-label="Приоритет">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NORMAL">Обычная</SelectItem>
            <SelectItem value="FIRST_NECESSITY">Первый день</SelectItem>
          </SelectContent>
        </Select>
        <TextInput
          type="number"
          min={1}
          step={1}
          value={quantity}
          onChange={(event) =>
            setQuantity(Math.max(1, Number(event.target.value) || 1))
          }
          aria-label="Количество"
          className="w-full sm:col-span-1"
        />
        <Button type="submit" disabled={!name.trim()}>
          Добавить
        </Button>
      </form>
      <div className="mt-4 grid gap-2">
        {pending.length ? (
          pending.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center gap-3 rounded-md bg-[#F5F3EE] p-3 text-sm"
            >
              <span className="min-w-0 flex-1">
                <strong>{item.name}</strong>
                <span className="ml-2 text-[#68716C]">
                  {item.quantity > 1 ? `${item.quantity} шт. · ` : ""}
                  {item.sourceRoom}
                  {item.priority === "FIRST_NECESSITY" ? " · Первый день" : ""}
                </span>
              </span>
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
                            sourceRooms: [...box.sourceRooms, item.sourceRoom],
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
                <SelectTrigger className="h-10 w-auto min-w-40 px-2 text-xs">
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
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Удалить ${item.name}`}
                onClick={() => {
                  if (window.confirm(`Удалить вещь «${item.name}»?`))
                    updateProject((current) => ({
                      ...current,
                      items: current.items.filter(
                        (entry) => entry.id !== item.id,
                      ),
                    }));
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#68716C]">Вещей для упаковки пока нет.</p>
        )}
      </div>
    </section>
  );
}
