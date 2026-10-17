import {
  ArrowRight,
  Box,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  PackageCheck,
  Plus,
  Search,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeading } from "@/components/movermate/ui";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  type Project,
  plural,
} from "@/configs/consts/movermate.const";
import { pages } from "@/configs/paths/pages.path";
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
  const moveDate = new Date(`${project.date}T12:00:00`);
  const daysLeft = Number.isNaN(moveDate.getTime())
    ? 0
    : Math.max(
        0,
        Math.ceil((moveDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      );
  const taskCount = project.tasks.length;
  const doneTasks = project.tasks.filter((task) => task.done).length;
  const packedBoxes = project.boxes.filter(
    (box) => box.status !== "packing",
  ).length;
  const unpackedItems = project.boxes.reduce(
    (total, box) => total + box.items.filter((item) => item.unpacked).length,
    0,
  );
  const itemCount = project.boxes.reduce(
    (total, box) => total + box.items.length,
    0,
  );
  const lostItems = project.boxes.flatMap((box) =>
    box.items.filter((item) => item.lost),
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
            onClick={() => router.push(`${pages.BOXES}?new=1`)}
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
            <div className="flex items-center gap-2 text-sm text-[#C8D5C8]">
              <CalendarClock className="size-4" />
              <span>
                До переезда{" "}
                {daysLeft === 1
                  ? "остался 1 день"
                  : `осталось ${daysLeft} ${plural(daysLeft, ["день", "дня", "дней"])}`}
              </span>
            </div>
            <p className="tnum mt-8 text-6xl font-extrabold tracking-[-0.08em] sm:text-7xl">
              {daysLeft}
            </p>
            <p className="mt-1 text-sm text-[#C8D5C8]">дней на подготовку</p>
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
                onClick={() => router.push(`${pages.BOXES}?find=1`)}
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
                {nextTask.due}.{" "}
                {nextTask.assignee || "Ответственный не назначен"}.
              </p>
              <button
                type="button"
                onClick={() => {
                  updateProject((current) => ({
                    ...current,
                    tasks: current.tasks.map((task) =>
                      task.id === nextTask.id ? { ...task, done: true } : task,
                    ),
                  }));
                  setJustDone(nextTask.title);
                }}
                className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-[#1D2923] underline decoration-[#D96B4C] decoration-2 underline-offset-4 transition-colors hover:text-[#42664D]"
              >
                Отметить сделанной <CheckCircle2 className="size-4" />
              </button>
            </>
          ) : (
            <p className="mt-5 text-lg font-bold">
              {justDone ? `«${justDone}» — сделано.` : "Все задачи выполнены."}
            </p>
          )}
        </div>
      </section>

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
          <div key={label} className={cn("rounded-2xl p-5", tone)}>
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

      <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold tracking-[0.1em] text-[#42664D] uppercase">
                Коробки
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.05em]">
                Готовность к переезду
              </h2>
            </div>
            <Truck className="size-6 text-[#42664D]" />
          </div>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#E8E2D5]">
            <div
              className="h-full rounded-full bg-[#42664D] transition-[width] duration-500"
              style={{
                width: `${project.boxes.length ? (packedBoxes / project.boxes.length) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="tnum mt-3 flex justify-between text-xs font-bold text-[#68716C]">
            <span>
              {packedBoxes}{" "}
              {plural(packedBoxes, ["коробка", "коробки", "коробок"])} готовы
            </span>
            <span>
              {project.boxes.length
                ? Math.round((packedBoxes / project.boxes.length) * 100)
                : 0}
              %
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push(pages.PROGRESS)}
          className="group cursor-pointer rounded-2xl bg-[#F3E7C8] p-6 text-left transition-colors duration-200 hover:bg-[#EBDDBB]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold tracking-[0.1em] text-[#77602B] uppercase">
                Комнаты
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.05em]">
                Что уже распаковано
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#77602B]">
                Отмечайте комнаты, как только их привели в порядок.
              </p>
            </div>
            <ArrowRight className="size-5 shrink-0 text-[#77602B] transition-transform group-hover:translate-x-1" />
          </div>
        </button>
      </section>
    </>
  );
}
