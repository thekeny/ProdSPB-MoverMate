import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FIRST_DAY_ITEMS } from "@/configs/consts/first-day.const";
import { pages } from "@/configs/paths/pages.path";
import { QUERY_PARAMS } from "@/configs/paths/query.path";
import type { Project } from "@/configs/types/project.type";
import { uid } from "@/lib/id";

export function FirstDayChecklist({
  project,
  canEdit,
  updateProject,
}: {
  project: Project;
  canEdit: boolean;
  updateProject: (apply: (project: Project) => Project) => Promise<boolean>;
}) {
  const items = project.items.filter(
    (item) => item.priority === "FIRST_NECESSITY",
  );
  const [pending, setPending] = useState<string | null>(null);
  const [room, setRoom] = useState(
    project.lastSourceRoom || project.sourceRooms[0] || "",
  );
  return (
    <section className="mt-5 rounded-lg bg-white p-5">
      <h2 className="font-extrabold">Первый день</h2>
      {canEdit && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Select
            value={room}
            onValueChange={(value) => value && setRoom(value)}
            items={project.sourceRooms.map((name) => ({
              value: name,
              label: name,
            }))}
          >
            <SelectTrigger
              className="w-full sm:w-auto"
              aria-label="Исходная комната вещей первого дня"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {project.sourceRooms.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            disabled={!room || pending !== null}
            loading={pending === "preset"}
            onClick={async () => {
              setPending("preset");
              try {
                await updateProject((current) => {
                  const names = new Set<string>(
                    FIRST_DAY_ITEMS.map((name) => name.toLocaleLowerCase("ru")),
                  );
                  const existing = new Set(
                    current.items.map((item) =>
                      item.name.trim().toLocaleLowerCase("ru"),
                    ),
                  );
                  return {
                    ...current,
                    items: [
                      ...current.items.map((item) =>
                        names.has(item.name.trim().toLocaleLowerCase("ru"))
                          ? { ...item, priority: "FIRST_NECESSITY" as const }
                          : item,
                      ),
                      ...FIRST_DAY_ITEMS.filter(
                        (name) => !existing.has(name.toLocaleLowerCase("ru")),
                      ).map((name) => ({
                        id: uid("item"),
                        name,
                        state: "TO_PACK" as const,
                        sourceRoom: room,
                        boxId: null,
                        quantity: 1,
                        priority: "FIRST_NECESSITY" as const,
                      })),
                    ],
                  };
                });
              } finally {
                setPending(null);
              }
            }}
          >
            Добавить базовый набор
          </Button>
        </div>
      )}
      <div className="mt-4 grid gap-2">
        {items.length ? (
          items.map((item) => {
            const box = project.boxes.find((entry) => entry.id === item.boxId);
            return (
              <div
                key={item.id}
                className="flex flex-col items-start gap-2 rounded-md bg-[#F5F3EE] p-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
              >
                <strong className="w-full min-w-0 [overflow-wrap:anywhere] sm:w-auto sm:flex-1">
                  {item.name}
                </strong>
                {(item.state !== "TAKEN_OUT" || !canEdit) && (
                  <span className="text-[#5C6560]">
                    {item.state === "TAKEN_OUT"
                      ? "На месте"
                      : item.state === "TO_PACK"
                        ? "Не упакована — возьмите с собой"
                        : item.state === "LOST"
                          ? "Потерялась"
                          : "В коробке"}
                  </span>
                )}
                {box && (
                  <Link
                    className="inline-flex min-h-11 items-center font-bold text-[#42664D] underline underline-offset-4"
                    href={`${pages.BOXES}?${QUERY_PARAMS.BOX_ID}=${encodeURIComponent(box.id)}`}
                  >
                    Открыть № {box.number}
                  </Link>
                )}
                {(item.state === "IN_BOX" || item.state === "TAKEN_OUT") &&
                  canEdit && (
                    <label
                      htmlFor={`first-day-${item.id}`}
                      className="flex min-h-11 items-center gap-2"
                    >
                      <Checkbox
                        id={`first-day-${item.id}`}
                        aria-label={`На месте: ${item.name}`}
                        checked={item.state === "TAKEN_OUT"}
                        disabled={
                          pending !== null || item.state === "TAKEN_OUT"
                        }
                        onCheckedChange={async () => {
                          setPending(item.id);
                          try {
                            await updateProject((current) => ({
                              ...current,
                              items: current.items.map((entry) =>
                                entry.id === item.id
                                  ? {
                                      ...entry,
                                      state: "TAKEN_OUT",
                                      boxId: null,
                                    }
                                  : entry,
                              ),
                            }));
                          } finally {
                            setPending(null);
                          }
                        }}
                      />
                      На месте
                    </label>
                  )}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-[#5C6560]">
            Добавьте базовый набор или отметьте свои вещи как «Первая
            необходимость».
          </p>
        )}
      </div>
    </section>
  );
}
