import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { ChipInput } from "@/components/ui/chip-input";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { TextInput } from "@/components/ui/text-input";
import { ROOM_PRESETS } from "@/configs/consts/rooms.const";
import type { Project, ProjectFlowMode } from "@/configs/types/project.type";
import { apiErrorMessage } from "@/lib/api-error";
import {
  getLocalDateInputMaxValue,
  getLocalDateInputValue,
} from "@/lib/date-time";
import { formatDate } from "@/lib/format";
import {
  type ProjectFormValues,
  projectCreationSchema,
} from "@/lib/forms/project.schema";

export function ProjectFlow({
  projects,
  mode,
  canEdit,
  setMode,
  setActiveId,
  onCreate,
}: {
  projects: Project[];
  mode: ProjectFlowMode;
  canEdit: boolean;
  setMode: (value: ProjectFlowMode) => void;
  setActiveId: (id: string) => void;
  onCreate: (values: ProjectFormValues) => Promise<void>;
}) {
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectCreationSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      date: "",
      from: "",
      to: "",
      sourceRooms: [...ROOM_PRESETS],
      destinationRooms: [...ROOM_PRESETS],
    },
  });
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
            {canEdit && (
              <Button
                onClick={() => setMode("create")}
                className="mt-6 h-11 w-full"
              >
                <Plus />
                Создать проект
              </Button>
            )}
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
            <form
              onSubmit={handleSubmit(async (values) => {
                setCreateError(null);
                setCreating(true);
                try {
                  await onCreate(values);
                } catch (error) {
                  setCreateError(apiErrorMessage(error));
                } finally {
                  setCreating(false);
                }
              })}
              noValidate
              className="mt-6 grid gap-4"
            >
              <Field label="Название" error={errors.name?.message}>
                <TextInput
                  {...register("name")}
                  maxLength={100}
                  placeholder="Переезд в новую квартиру"
                />
              </Field>
              <Field label="Дата переезда" error={errors.date?.message}>
                <TextInput
                  {...register("date")}
                  type="date"
                  min={getLocalDateInputValue()}
                  max={getLocalDateInputMaxValue()}
                />
              </Field>
              <Field label="Откуда (необязательно)">
                <TextInput
                  {...register("from")}
                  maxLength={200}
                  placeholder="ул. Ленина, 14"
                />
              </Field>
              <Field label="Куда (необязательно)">
                <TextInput
                  {...register("to")}
                  maxLength={200}
                  placeholder="ул. Садовая, 8"
                />
              </Field>
              <Field label="Комнаты откуда">
                <Controller
                  control={control}
                  name="sourceRooms"
                  render={({ field }) => (
                    <ChipInput
                      ariaLabel="Комнаты откуда"
                      value={field.value}
                      onValueChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Введите комнату и нажмите Enter"
                      enterOnly
                      maxLength={50}
                    />
                  )}
                />
              </Field>
              <Field label="Комнаты куда">
                <Controller
                  control={control}
                  name="destinationRooms"
                  render={({ field }) => (
                    <ChipInput
                      ariaLabel="Комнаты куда"
                      value={field.value}
                      onValueChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Введите комнату и нажмите Enter"
                      enterOnly
                      maxLength={50}
                    />
                  )}
                />
              </Field>
              <FormError errors={errors} message={createError} />
              <Button type="submit" disabled={creating} className="mt-2 h-11">
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
