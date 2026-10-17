import {
  ArrowRight,
  Box,
  CheckCircle2,
  CircleAlert,
  PackageCheck,
  Plus,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/ui/page-heading";
import { DATE_NOON_SUFFIX, MS_PER_DAY } from "@/configs/consts/date.const";
import { pages } from "@/configs/paths/pages.path";
import { QUERY_PARAMS } from "@/configs/paths/query.path";
import type { Project } from "@/configs/types/project.type";
import { formatDate, formatTaskDue, plural } from "@/lib/format";
import { cn } from "@/lib/utils";

export function DashboardView({
  project,
  updateProject,
}: {
  project: Project;
  updateProject: (apply: (project: Project) => Project) => void;
}) {
  const router = useRouter();
  const [justDone, setJustDone] = useState<string | null>(null);
  const moveDate = new Date(`${project.date}${DATE_NOON_SUFFIX}`);
  const daysLeft = Number.isNaN(moveDate.getTime())
    ? 0
    : Math.max(0, Math.ceil((moveDate.getTime() - Date.now()) / MS_PER_DAY));
  const taskCount = project.tasks.length;
  const doneTasks = project.tasks.filter((task) => task.done).length;
  const packedBoxes = project.boxes.filter(
    (box) => box.status !== "packing",
  ).length;
  const unpackedItems = project.items.filter(
    (item) => item.state === "TAKEN_OUT",
  ).length;
  const itemCount = project.items.length;
  const lostItems = project.items.filter((item) => item.state === "LOST");
  const boxesToFill = project.boxes.filter(
    (box) =>
      box.status === "packing" &&
      !project.items.some(
        (item) => item.boxId === box.id && item.state === "IN_BOX",
      ),
  );
  const nextTask = project.tasks.find((task) => !task.done);

  return (
    <>
      <PageHeading
        eyebrow="Обзор"
        title={project.name}
        description={`${project.from || "Текущий адрес"} → ${project.to || "Новый адрес"}. Переезд ${formatDate(project.date)}.`}
        action={
          <Button
            onClick={() => router.push(`${pages.BOXES}?${QUERY_PARAMS.NEW}=1`)}
            className="h-11"
          >
            <Plus />
            Новая коробка
          </Button>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="relative overflow-hidden rounded-[24px] bg-[#1D2923] p-6 text-[#F4F1E9] sm:p-8">
          <div className="relative z-10 max-w-lg">
            <p className="tnum text-6xl font-extrabold tracking-[-0.08em] sm:text-7xl">
              {daysLeft}
            </p>
            <p className="mt-1 text-sm text-[#C8D5C8]">
              {plural(daysLeft, ["день", "дня", "дней"])} до переезда
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => router.push(pages.PLAN)}
                className="bg-[#D96B4C] text-white hover:bg-[#C85C3E]"
              >
                Открыть план <ArrowRight />
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  router.push(`${pages.BOXES}?${QUERY_PARAMS.FIND}=1`)
                }
                className="text-[#F4F1E9] hover:bg-white/10 hover:text-white"
              >
                <Search />
                Найти вещь
              </Button>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-24 size-64 rounded-full border-[28px] border-[#42664D]/60" />
          <div className="absolute right-16 -bottom-16 size-36 rounded-full border-[18px] border-[#D96B4C]/70" />
        </div>

        <div className="rounded-[24px] bg-[#E2E9DD] p-6 sm:p-8">
          <p className="text-xs font-extrabold tracking-[0.1em] text-[#42664D] uppercase">
            Следующий шаг
          </p>
          {nextTask ? (
            <>
              <h2 className="mt-5 text-2xl font-extrabold tracking-[-0.05em]">
                {nextTask.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#4E5752]">
                {formatTaskDue(nextTask.dueAt)}.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {nextTask.assignees.length ? (
                  nextTask.assignees.map((assignee) => (
                    <span
                      key={assignee}
                      className="rounded-md bg-[#EDF1E8] px-2 py-1 text-xs text-[#42664D]"
                    >
                      {assignee}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#68716C]">
                    Ответственный не назначен
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  updateProject((current) => ({
                    ...current,
                    tasks: current.tasks.map((task) =>
                      task.id === nextTask.id ? { ...task, done: true } : task,
                    ),
                  }));
                  setJustDone(nextTask.title);
                }}
                className="mt-8 h-auto gap-2 p-0 text-sm font-extrabold text-[#1D2923] underline decoration-[#D96B4C] decoration-2 underline-offset-4 transition-colors hover:bg-transparent hover:text-[#42664D]"
              >
                Отметить сделанной <CheckCircle2 className="size-4" />
              </Button>
            </>
          ) : (
            <p className="mt-5 text-lg font-bold">
              {justDone ? `«${justDone}» — сделано.` : "Все задачи выполнены."}
            </p>
          )}
        </div>
      </section>
      {boxesToFill.length > 0 && (
        <section className="mt-5 rounded-lg bg-[#F3E7C8] p-5">
          <h2 className="font-extrabold">Заполнить коробки</h2>
          <p className="mt-1 text-sm text-[#77602B]">
            Эти коробки ещё собираются и пока без вещей.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {boxesToFill.map((box) => (
              <Button
                key={box.id}
                variant="ghost"
                onClick={() =>
                  router.push(
                    `${pages.BOXES}?${QUERY_PARAMS.BOX_ID}=${encodeURIComponent(box.id)}`,
                  )
                }
                className="h-auto justify-start rounded-md bg-white p-3 text-left whitespace-normal"
              >
                № {box.number} · {box.title}
              </Button>
            ))}
          </div>
        </section>
      )}

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Коробки собраны",
            value: `${packedBoxes}/${project.boxes.length}`,
            icon: Box,
            tone: "bg-white",
          },
          {
            label: "Задачи выполнены",
            value: `${doneTasks}/${taskCount}`,
            icon: CheckCircle2,
            tone: "bg-white",
          },
          {
            label: "Вещи распакованы",
            value: `${unpackedItems}/${itemCount}`,
            icon: PackageCheck,
            tone: "bg-white",
          },
          {
            label: "Потеряшки",
            value: String(lostItems.length),
            icon: CircleAlert,
            tone: lostItems.length ? "bg-[#F9E8E2]" : "bg-white",
          },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className={cn("rounded-lg p-5", tone)}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-[#68716C]">{label}</p>
              <Icon className="size-5 text-[#42664D]" />
            </div>
            <p className="tnum mt-4 text-3xl font-extrabold tracking-[-0.06em]">
              {value}
            </p>
          </div>
        ))}
      </section>
    </>
  );
}
