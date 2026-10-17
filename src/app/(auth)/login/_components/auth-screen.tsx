import { ArrowRight } from "lucide-react";
import type { FormEvent } from "react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { TextInput } from "@/components/ui/text-input";
import type { AuthMode } from "@/configs/types/auth.type";
import { cn } from "@/lib/utils";

export function AuthScreen({
  mode,
  setMode,
  onSubmit,
  pending,
  error,
}: {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  pending: boolean;
  error: string | null;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F5F3EE] p-5">
      <section className="w-full max-w-md rounded-xl bg-white p-7 sm:p-9">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="mt-8 grid grid-cols-2 rounded-md bg-[#EDF1E8] p-1">
          <Button
            variant="ghost"
            onClick={() => setMode("login")}
            className={cn(
              "h-auto rounded-sm py-2 text-xs font-bold",
              mode === "login" && "bg-white",
            )}
          >
            Вход
          </Button>
          <Button
            variant="ghost"
            onClick={() => setMode("register")}
            className={cn(
              "h-auto rounded-sm py-2 text-xs font-bold",
              mode === "register" && "bg-white",
            )}
          >
            Регистрация
          </Button>
        </div>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <Field label="Имя пользователя">
            <TextInput
              name="username"
              required
              minLength={3}
              maxLength={32}
              placeholder="mover"
              autoCapitalize="none"
              spellCheck={false}
              autoComplete="username"
            />
          </Field>
          <p className="-mt-2 text-xs text-[#68716C]">
            От 3 до 32 символов. Регистр букв не важен.
          </p>
          <Field label="Пароль">
            <TextInput
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={128}
              placeholder="Минимум 8 символов"
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
                minLength={8}
                maxLength={128}
                placeholder="Повторите пароль"
                autoComplete="new-password"
              />
            </Field>
          )}
          {error && (
            <p role="alert" className="text-xs font-bold text-[#A84D3C]">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={pending}
            className="mt-2 h-11 w-full text-sm"
          >
            {pending
              ? "Подождите…"
              : mode === "login"
                ? "Войти"
                : "Зарегистрироваться"}
            {!pending && <ArrowRight />}
          </Button>
        </form>
      </section>
    </main>
  );
}
