import { CircleAlert } from "lucide-react";
import { useState } from "react";
import type {
  BoxStatusCounts,
  LoadingChecklistRoom,
  UnpackingProgressRoom,
} from "@/api/generated/types.gen";
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
import { LIST_PAGE_SIZE } from "@/configs/consts/lists.const";
import { roomIcon } from "@/configs/consts/rooms.const";
import { statuses } from "@/configs/consts/statuses.const";
import type { Item } from "@/configs/types/box.type";
import type { Project } from "@/configs/types/project.type";
import { cn } from "@/lib/utils";
import { FirstDayChecklist } from "./first-day-checklist";
import { LostItemSuggestions } from "./lost-item-suggestions";

export function ProgressView({
  project,
  canEdit,
  loadingChecklist,
  unpackingProgress,
  boxStatusCounts,
  updateProject,
}: {
  project: Project;
  canEdit: boolean;
  loadingChecklist?: LoadingChecklistRoom[];
  unpackingProgress?: UnpackingProgressRoom[];
  boxStatusCounts?: BoxStatusCounts;
  updateProject: (apply: (project: Project) => Project) => Promise<boolean>;
}) {
  const [foundItem, setFoundItem] = useState<Item | null>(null);
  const [foundPlace, setFoundPlace] = useState("source");
  const [lostLimit, setLostLimit] = useState(LIST_PAGE_SIZE);
  const [savingFound, setSavingFound] = useState(false);
  const lost = project.items.filter((item) => item.state === "LOST");
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
              {boxStatusCounts
                ? boxStatusCounts[
                    status.key.toUpperCase() as keyof BoxStatusCounts
                  ]
                : project.boxes.filter((box) => box.status === status.key)
                    .length}
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
                {lost.slice(0, lostLimit).map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center gap-3 rounded-md bg-[#F9E8E2] p-3 text-sm"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="[overflow-wrap:anywhere]">
                        <strong>{item.name}</strong> · {item.sourceRoom}
                      </span>
                    </span>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setFoundItem(item);
                          setFoundPlace("source");
                        }}
                      >
                        Нашлась
                      </Button>
                    )}
                    <LostItemSuggestions
                      projectId={project.id}
                      itemId={item.id}
                      online={canEdit}
                    />
                  </div>
                ))}
                {lost.length > lostLimit && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setLostLimit((current) => current + LIST_PAGE_SIZE)
                    }
                  >
                    Ещё потерянные вещи
                  </Button>
                )}
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
            {(
              loadingChecklist ??
              project.sourceRooms.map((name) => ({
                room: { id: name, name },
                to_pack_count: 0,
                boxes: project.boxes
                  .filter((box) => box.sourceRooms.includes(name))
                  .map((box) => ({
                    id: box.id,
                    number: box.number,
                    status:
                      box.status === "packing"
                        ? ("PACKING" as const)
                        : box.status === "packed"
                          ? ("PACKED" as const)
                          : box.status === "loaded"
                            ? ("LOADED" as const)
                            : box.status === "delivered"
                              ? ("DELIVERED" as const)
                              : ("UNPACKED" as const),
                    destination_room: { id: box.room, name: box.room },
                  })),
                is_loaded: false,
              }))
            ).map((entry) => {
              const name = entry.room.name;
              const boxes = entry.boxes;
              const loaded = boxes.filter((box) =>
                ["LOADED", "DELIVERED", "UNPACKED"].includes(box.status),
              ).length;
              const Icon = roomIcon(name);
              return (
                <div
                  key={name}
                  className="flex items-center gap-3 rounded-md bg-[#F5F3EE] p-3"
                >
                  <Icon className="size-4 text-[#42664D]" />
                  <span className="min-w-0 flex-1 text-xs font-bold">
                    <span className="[overflow-wrap:anywhere]">{name}</span>
                  </span>
                  <span className="tnum text-xs text-[#68716C]">
                    {entry.is_loaded
                      ? "Погружено"
                      : `Погружено ${loaded} из ${boxes.length}${entry.to_pack_count ? ` · осталось упаковать ${entry.to_pack_count}` : ""}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-lg bg-white p-5">
          <h2 className="font-extrabold">Распаковка по комнатам</h2>
          <div className="mt-4 grid gap-3">
            {(
              unpackingProgress ??
              project.destinationRooms.map((name) => ({
                room: { id: name, name },
                total: project.boxes.filter((box) => box.room === name).length,
                unpacked: project.boxes.filter(
                  (box) => box.room === name && box.status === "unpacked",
                ).length,
              }))
            ).map((entry) => {
              const name = entry.room.name;
              return (
                <div
                  key={name}
                  className="flex justify-between rounded-md bg-[#F5F3EE] p-3 text-xs"
                >
                  <strong className="[overflow-wrap:anywhere]">{name}</strong>
                  <span className="tnum">
                    Распаковано {entry.unpacked} из {entry.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <FirstDayChecklist
        key={project.id}
        project={project}
        canEdit={canEdit}
        updateProject={updateProject}
      />
      {foundItem && canEdit && (
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
              disabled={savingFound}
              loading={savingFound}
              onClick={async () => {
                const box = project.boxes.find(
                  (entry) => entry.id === foundPlace,
                );
                setSavingFound(true);
                try {
                  const saved = await updateProject((current) => ({
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
                  if (saved) setFoundItem(null);
                } finally {
                  setSavingFound(false);
                }
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
