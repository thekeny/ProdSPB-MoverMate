import { ArrowLeft, ArrowRight, ChevronRight, Plus } from "lucide-react";
import type { FormEvent } from "react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { TextInput } from "@/components/ui/text-input";
import { ROOM_PRESETS } from "@/configs/consts/rooms.const";
import type { Project, ProjectFlowMode } from "@/configs/types/project.type";
import { formatDate } from "@/lib/format";

export function ProjectFlow({
  projects,
  mode,
  setMode,
  setActiveId,
  onCreate,
}: {
  projects: Project[];
  mode: ProjectFlowMode;
  setMode: (value: ProjectFlowMode) => void;
  setActiveId: (id: string) => void;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F5F3EE] p-5">
      <section className="w-full max-w-md rounded-xl bg-white p-7">
        <Logo />
        {mode === "select" ? (
          <>
            <h1 className="mt-9 text-3xl font-extrabold tracking-[-0.05em]">
              Ваши переезды
            </h1>
            <p className="mt-2 text-sm text-[#68716C]">
              Выберите проект или создайте новый.
            </p>
            {projects.length > 0 && (
              <div className="mt-6 grid gap-2">
                {projects.map((project) => (
                  <Button
                    variant="ghost"
                    key={project.id}
                    onClick={() => setActiveId(project.id)}
                    className="h-auto w-full justify-between rounded-md bg-[#EDF1E8] p-4 text-left whitespace-normal transition-colors duration-200 hover:bg-[#E2E9DD]"
                  >
                    <span>
                      <span className="block text-sm font-bold">
                        {project.name}
                      </span>
                      <span className="mt-1 block text-xs text-[#68716C]">
                        {formatDate(project.date)}
                      </span>
                    </span>
                    <ChevronRight className="size-5 text-[#42664D]" />
                  </Button>
                ))}
              </div>
            )}
            <Button
              onClick={() => setMode("create")}
              className="mt-6 h-11 w-full"
            >
              <Plus />
              Создать проект
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              onClick={() => setMode("select")}
              className="mt-8 h-auto gap-2 p-0 text-xs font-bold text-[#42664D] transition-colors duration-200 hover:bg-transparent hover:text-[#1D2923]"
            >
              <ArrowLeft className="size-4" />
              Назад к проектам
            </Button>
            <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.05em]">
              Новый переезд
            </h1>
            <form onSubmit={onCreate} className="mt-6 grid gap-4">
              <Field label="Название">
                <TextInput
                  required
                  name="name"
                  placeholder="Переезд в новую квартиру"
                />
              </Field>
              <Field label="Дата переезда">
                <TextInput required name="date" type="date" />
              </Field>
              <Field label="Откуда (необязательно)">
                <TextInput name="from" placeholder="ул. Ленина, 14" />
              </Field>
              <Field label="Куда (необязательно)">
                <TextInput name="to" placeholder="ул. Садовая, 8" />
              </Field>
              <Field label="Комнаты откуда, через запятую">
                <TextInput
                  name="sourceRooms"
                  defaultValue={ROOM_PRESETS.join(", ")}
                />
              </Field>
              <Field label="Комнаты куда, через запятую">
                <TextInput
                  name="destinationRooms"
                  defaultValue={ROOM_PRESETS.join(", ")}
                />
              </Field>
              <Button type="submit" className="mt-2 h-11">
                Создать
                <ArrowRight />
              </Button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
