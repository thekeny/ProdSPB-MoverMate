import {
  ArrowRight,
  Box,
  CheckCircle2,
  CircleAlert,
  PackageCheck,
  Plus,
  Search,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProjectSummary } from "@/api/generated/types.gen";
import { mapTask } from "@/api/project-data";
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
  summary,
  updateProject,
  canEdit,
}: {
  project: Project;
  summary?: ProjectSummary;
  updateProject: (apply: (project: Project) => Project) => void;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [justDone, setJustDone] = useState<string | null>(null);
  const moveDate = new Date(`${project.date}${DATE_NOON_SUFFIX}`);
  const daysLeft = Number.isNaN(moveDate.getTime())
    ? 0
    : Math.max(0, Math.ceil((moveDate.getTime() - Date.now()) / MS_PER_DAY));
  const taskCount = summary?.tasks.total ?? project.tasks.length;
  const doneTasks =
    summary?.tasks.done ?? project.tasks.filter((task) => task.done).length;
  const packedBoxes =
    summary?.boxes.total != null
      ? summary.boxes.total - summary.boxes.by_status.PACKING
      : project.boxes.filter((box) => box.status !== "packing").length;
  const unpackedItems =
    summary?.items.by_state.TAKEN_OUT ??
    project.items.filter((item) => item.state === "TAKEN_OUT").length;
  const itemCount = summary?.items.total ?? project.items.length;
  const lostCount =
    summary?.items.by_state.LOST ??
    project.items.filter((item) => item.state === "LOST").length;
  const boxesToFill = project.boxes.filter(
    (box) =>
      box.status === "packing" &&
      !project.items.some(
        (item) => item.boxId === box.id && item.state === "IN_BOX",
      ),
  );
  const nextTask = summary?.next_task
    ? mapTask(summary.next_task)
    : project.tasks.find((task) => !task.done);

  return (
    <>
      <PageHeading
        eyebrow="Обзор"
        title={project.name}
        description={`${project.from || "Текущий адрес"} → ${project.to || "Новый адрес"}. Переезд ${formatDate(project.date)}.`}
        action={
          canEdit ? (
            <Button
              onClick={() =>
                router.push(`${pages.BOXES}?${QUERY_PARAMS.NEW}=1`)
              }
              className="h-11"
            >
              <Plus />
              Новая коробка
            </Button>
          ) : undefined
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr] xl:gap-5 2xl:grid-cols-[1.5fr_0.75fr]">
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
                className="bg-[#F4F1E9] text-[#1D2923] hover:bg-white"
              >
                Открыть план <ArrowRight />
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  router.push(`${pages.BOXES}?${QUERY_PARAMS.FIND}=1`)
                }
                className="text-[#F4F1E9] bg-[#222d27] hover:bg-white/10 hover:text-white"
              >
                <Search />
                Найти вещь
              </Button>
            </div>
          </div>
          <Image
            src="/images/box.png"
            alt=""
            aria-hidden="true"
            width={480}
            height={480}
            className="pointer-events-none absolute -right-16 -bottom-16 object-contain sm:-right-20 sm:-bottom-20 sm:size-[24rem] opacity-50"
          />
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
                      <span className="[overflow-wrap:anywhere]">
                        {assignee}
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#5C6560]">
                    Ответственный не назначен
                  </span>
                )}
              </div>
              {canEdit && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    updateProject((current) => ({
                      ...current,
                      tasks: current.tasks.map((task) =>
                        task.id === nextTask.id
                          ? { ...task, done: true }
                          : task,
                      ),
                    }));
                    setJustDone(nextTask.title);
                  }}
                  className="mt-8 h-auto gap-2 p-0 text-sm font-extrabold text-[#1D2923] underline decoration-[#D96B4C] decoration-2 underline-offset-4 transition-colors hover:bg-transparent hover:text-[#42664D]"
                >
                  Отметить сделанной <CheckCircle2 className="size-4" />
                </Button>
              )}
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
                <span className="[overflow-wrap:anywhere]">
                  № {box.number} · {box.title}
                </span>
              </Button>
            ))}
          </div>
        </section>
      )}

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-4">
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
            value: String(lostCount),
            icon: CircleAlert,
            tone: lostCount ? "bg-[#F9E8E2]" : "bg-white",
          },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className={cn("rounded-lg p-5", tone)}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-[#5C6560]">{label}</p>
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
