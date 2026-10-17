import { Box, CircleAlert } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeading } from "@/components/ui/page-heading";
import { rooms } from "@/configs/consts/rooms.const";
import { statuses } from "@/configs/consts/statuses.const";
import type { Project } from "@/configs/types/project.type";
import { cn } from "@/lib/utils";

export function ProgressView({
  project,
  updateProject,
}: {
  project: Project;
  updateProject: (apply: (project: Project) => Project) => void;
}) {
  const lost = project.boxes.flatMap((box) =>
    box.items.filter((item) => item.lost).map((item) => ({ box, item })),
  );
  return (
    <>
      <PageHeading
        eyebrow="Прогресс"
        title="Прогресс переезда"
        description="Статусы коробок, погрузка по комнатам и список дел на первый день."
      />
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statuses.map((item) => (
          <div key={item.key} className="rounded-lg bg-white p-4">
            <p className="text-xs text-[#68716C]">{item.label}</p>
            <p className="tnum mt-2 text-3xl font-extrabold tracking-[-0.05em]">
              {project.boxes.filter((box) => box.status === item.key).length}
            </p>
          </div>
        ))}
      </section>
      <section className="mt-5 rounded-lg bg-white p-5">
        <div className="flex gap-3">
          <CircleAlert
            className={cn(
              "mt-0.5 size-5",
              lost.length ? "text-[#A84D3C]" : "text-[#42664D]",
            )}
          />
          <div>
            <h2 className="font-extrabold">Потерянные вещи</h2>
            {lost.length ? (
              <div className="mt-3 grid gap-2">
                {lost.map(({ box, item }) => (
                  <p
                    key={item.id}
                    className="rounded-[8px] bg-[#F9E8E2] p-3 text-sm text-[#A84D3C]"
                  >
                    <strong>{item.name}</strong> числится в {box.id}, {box.room}
                    .
                  </p>
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
          <p className="mt-1 text-xs text-[#68716C]">
            Отметьте комнату, когда все её коробки погружены.
          </p>
          <div className="mt-4 grid gap-3">
            {rooms.map(({ name }) => {
              const RoomIcon =
                rooms.find((room) => room.name === name)?.Icon ?? Box;
              const boxes = project.boxes.filter((box) => box.room === name);
              const loaded = boxes.filter(
                (box) => box.status === "loaded" || box.status === "delivered",
              ).length;
              const ready = boxes.length > 0 && loaded === boxes.length;
              return (
                <label
                  key={name}
                  htmlFor={`room-loaded-${name}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md p-3 transition-colors duration-200",
                    ready
                      ? "bg-[#E2E9DD] hover:bg-[#D6E1D0]"
                      : "bg-[#F5F3EE] hover:bg-[#EDF1E8]",
                  )}
                >
                  <Checkbox
                    id={`room-loaded-${name}`}
                    checked={Boolean(project.roomsLoaded[name])}
                    onCheckedChange={() =>
                      updateProject((current) => ({
                        ...current,
                        roomsLoaded: {
                          ...current.roomsLoaded,
                          [name]: !current.roomsLoaded[name],
                        },
                      }))
                    }
                  />
                  <RoomIcon className="size-4 text-[#42664D]" />
                  <span className="min-w-0 flex-1 text-xs font-bold">
                    {name}
                  </span>
                  <span className="tnum shrink-0 text-right text-[11px] text-[#68716C] sm:text-xs">
                    Погружено {loaded} из {boxes.length}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="rounded-lg bg-white p-5">
          <h2 className="font-extrabold">Первый день</h2>
          <p className="mt-1 text-xs text-[#68716C]">
            Самое нужное — держите при себе, а не в коробках.
          </p>
          <div className="mt-4 grid gap-1">
            {project.firstDay.map((item) => (
              <label
                key={item.id}
                htmlFor={`first-day-${item.id}`}
                className="flex cursor-pointer items-center gap-3 rounded-[8px] p-2 hover:bg-[#EDF1E8]"
              >
                <Checkbox
                  id={`first-day-${item.id}`}
                  checked={item.done}
                  onCheckedChange={() =>
                    updateProject((current) => ({
                      ...current,
                      firstDay: current.firstDay.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, done: !entry.done }
                          : entry,
                      ),
                    }))
                  }
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    item.done && "text-[#68716C] line-through",
                  )}
                >
                  {item.title}
                </span>
              </label>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
