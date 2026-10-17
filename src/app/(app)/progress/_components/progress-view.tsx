import { CircleAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { PageHeading } from "@/components/ui/page-heading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { roomIcon } from "@/configs/consts/rooms.const";
import { statuses } from "@/configs/consts/statuses.const";
import type { Item } from "@/configs/types/box.type";
import type { Project } from "@/configs/types/project.type";
import { cn } from "@/lib/utils";

export function ProgressView({
  project,
  updateProject,
}: {
  project: Project;
  updateProject: (apply: (project: Project) => Project) => void;
}) {
  const [foundItem, setFoundItem] = useState<Item | null>(null);
  const [foundPlace, setFoundPlace] = useState("source");
  const lost = project.items.filter((item) => item.state === "LOST");
  const firstDay = project.items.filter(
    (item) => item.priority === "FIRST_NECESSITY",
  );
  const boxesBySuggestion = foundItem
    ? [...project.boxes].sort(
        (a, b) =>
          Number(b.sourceRooms.includes(foundItem.sourceRoom)) -
            Number(a.sourceRooms.includes(foundItem.sourceRoom)) ||
          a.number - b.number,
      )
    : project.boxes;
  return (
    <>
      <PageHeading
        eyebrow="Прогресс"
        title="Прогресс переезда"
        description="Коробки, погрузка и вещи первой необходимости."
      />
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {statuses.map((status) => (
          <div key={status.key} className="rounded-lg bg-white p-4">
            <p className="text-xs text-[#68716C]">{status.label}</p>
            <p className="tnum mt-2 text-3xl font-extrabold">
              {project.boxes.filter((box) => box.status === status.key).length}
            </p>
          </div>
        ))}
      </section>
      <section className="mt-5 rounded-lg bg-white p-5">
        <div className="flex items-start gap-3">
          <CircleAlert
            className={cn(
              "mt-0.5 size-5",
              lost.length ? "text-[#A84D3C]" : "text-[#42664D]",
            )}
          />
          <div className="flex-1">
            <h2 className="font-extrabold">Потерянные вещи</h2>
            {lost.length ? (
              <div className="mt-3 grid gap-2">
                {lost.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center gap-3 rounded-md bg-[#F9E8E2] p-3 text-sm"
                  >
                    <span className="min-w-0 flex-1">
                      <strong>{item.name}</strong> · {item.sourceRoom}
                    </span>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setFoundItem(item);
                        setFoundPlace("source");
                      }}
                    >
                      Нашлась
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-sm text-[#68716C]">
                Потерянных вещей нет.
              </p>
            )}
          </div>
        </div>
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="rounded-lg bg-white p-5">
          <h2 className="font-extrabold">Погрузка по комнатам</h2>
          <div className="mt-4 grid gap-3">
            {project.sourceRooms.map((name) => {
              const boxes = project.boxes.filter((box) =>
                box.sourceRooms.includes(name),
              );
              const loaded = boxes.filter((box) =>
                ["loaded", "delivered", "unpacked"].includes(box.status),
              ).length;
              const Icon = roomIcon(name);
              return (
                <div
                  key={name}
                  className="flex items-center gap-3 rounded-md bg-[#F5F3EE] p-3"
                >
                  <Icon className="size-4 text-[#42664D]" />
                  <span className="min-w-0 flex-1 text-xs font-bold">
                    {name}
                  </span>
                  <span className="tnum text-xs text-[#68716C]">
                    {boxes.length > 0 && loaded === boxes.length
                      ? "Погружено"
                      : `Погружено ${loaded} из ${boxes.length}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-lg bg-white p-5">
          <h2 className="font-extrabold">Распаковка по комнатам</h2>
          <div className="mt-4 grid gap-3">
            {project.destinationRooms.map((name) => {
              const boxes = project.boxes.filter((box) => box.room === name);
              const unpacked = boxes.filter(
                (box) => box.status === "unpacked",
              ).length;
              return (
                <div
                  key={name}
                  className="flex justify-between rounded-md bg-[#F5F3EE] p-3 text-xs"
                >
                  <strong>{name}</strong>
                  <span className="tnum">
                    Распаковано {unpacked} из {boxes.length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="mt-5 rounded-lg bg-white p-5">
        <h2 className="font-extrabold">Первый день</h2>
        <div className="mt-4 grid gap-2">
          {firstDay.length ? (
            firstDay.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap justify-between gap-2 rounded-md bg-[#F5F3EE] p-3 text-sm"
              >
                <strong>{item.name}</strong>
                <span className="text-[#68716C]">
                  {item.state === "TAKEN_OUT"
                    ? "На месте"
                    : item.state === "TO_PACK"
                      ? "Не упакована — возьмите с собой"
                      : item.state === "LOST"
                        ? "Потерялась"
                        : "В коробке"}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#68716C]">
              Отметьте нужные вещи как «Первая необходимость».
            </p>
          )}
        </div>
      </section>
      {foundItem && (
        <Modal
          className="max-w-xl"
          label={`Где нашлась вещь ${foundItem.name}`}
          onClose={() => setFoundItem(null)}
        >
          <h2 className="text-xl font-extrabold">Где нашлась вещь?</h2>
          <p className="mt-2 text-sm text-[#68716C]">
            {foundItem.name} · {foundItem.sourceRoom}
          </p>
          <Field label="Место">
            <Select
              value={foundPlace}
              onValueChange={(value) => value && setFoundPlace(value)}
              items={[
                {
                  label: `В исходной комнате — ${foundItem.sourceRoom}`,
                  value: "source",
                },
                { label: "Уже на месте", value: "taken" },
                ...boxesBySuggestion.map((box) => ({
                  label: `В коробке № ${box.number} — ${box.title}`,
                  value: box.id,
                })),
              ]}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="source">
                  В исходной комнате — {foundItem.sourceRoom}
                </SelectItem>
                <SelectItem value="taken">Уже на месте</SelectItem>
                {boxesBySuggestion.map((box) => (
                  <SelectItem key={box.id} value={box.id}>
                    В коробке № {box.number} — {box.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setFoundItem(null)}>
              Отмена
            </Button>
            <Button
              onClick={() => {
                const box = project.boxes.find(
                  (entry) => entry.id === foundPlace,
                );
                updateProject((current) => ({
                  ...current,
                  boxes: box
                    ? current.boxes.map((entry) =>
                        entry.id === box.id &&
                        !entry.sourceRooms.includes(foundItem.sourceRoom)
                          ? {
                              ...entry,
                              sourceRooms: [
                                ...entry.sourceRooms,
                                foundItem.sourceRoom,
                              ],
                            }
                          : entry,
                      )
                    : current.boxes,
                  items: current.items.map((entry) =>
                    entry.id === foundItem.id
                      ? {
                          ...entry,
                          state:
                            foundPlace === "source"
                              ? "TO_PACK"
                              : foundPlace === "taken"
                                ? "TAKEN_OUT"
                                : "IN_BOX",
                          boxId: box?.id ?? null,
                        }
                      : entry,
                  ),
                }));
                setFoundItem(null);
              }}
            >
              Сохранить место
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
