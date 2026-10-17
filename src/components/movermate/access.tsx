import { ArrowLeft, ArrowRight, ChevronRight, Plus } from "lucide-react";
import type { FormEvent } from "react";
import { Field, Logo, TextInput } from "@/components/movermate/ui";
import { Button } from "@/components/ui/button";
import { formatDate, type Project } from "@/configs/consts/movermate.const";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";
type ProjectFlowMode = "select" | "create";

export function AuthScreen({
  mode,
  setMode,
  onSubmit,
}: {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F5F3EE] p-5">
      <section className="w-full max-w-md rounded-3xl bg-white p-7 sm:p-9">
        <Logo />
        <div className="mt-8 grid grid-cols-2 rounded-lg bg-[#EDF1E8] p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={cn(
              "rounded-md py-2 text-xs font-bold",
              mode === "login" && "bg-white",
            )}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={cn(
              "rounded-md py-2 text-xs font-bold",
              mode === "register" && "bg-white",
            )}
          >
            Регистрация
          </button>
        </div>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <Field label="Имя пользователя">
            <TextInput
              name="username"
              required
              minLength={3}
              placeholder="mover"
              autoComplete="username"
            />
          </Field>
          <Field label="Пароль">
            <TextInput
              name="password"
              type="password"
              required
              minLength={4}
              placeholder="Минимум 4 символа"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />
          </Field>
          {mode === "register" && (
            <Field label="Повторите пароль">
              <TextInput
                name="confirmPassword"
                type="password"
                required
                minLength={4}
                placeholder="Повторите пароль"
                autoComplete="new-password"
              />
            </Field>
          )}
          <Button type="submit" className="mt-2 h-11 w-full text-sm">
            {mode === "login" ? "Войти" : "Зарегистрироваться"}
            <ArrowRight />
          </Button>
        </form>
      </section>
    </main>
  );
}

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
      <section className="w-full max-w-md rounded-3xl bg-white p-7">
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
                  <button
                    type="button"
                    key={project.id}
                    onClick={() => setActiveId(project.id)}
                    className="flex items-center justify-between rounded-xl bg-[#EDF1E8] p-4 text-left transition-colors duration-200 hover:bg-[#E2E9DD]"
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
                  </button>
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
            <button
              type="button"
              onClick={() => setMode("select")}
              className="mt-8 inline-flex items-center gap-2 text-xs font-bold text-[#42664D] transition-colors duration-200 hover:text-[#1D2923]"
            >
              <ArrowLeft className="size-4" />
              Назад к проектам
            </button>
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
