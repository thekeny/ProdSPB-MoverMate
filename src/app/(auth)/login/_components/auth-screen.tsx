import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TextInput } from "@/components/ui/text-input";
import { TEST_USERS } from "@/configs/consts/test-users.const";
import type { AuthMode } from "@/configs/types/auth.type";
import { type AuthFormValues, authFormSchema } from "@/lib/forms/auth.schema";
import { cn } from "@/lib/utils";

export function AuthScreen({
  mode,
  setMode,
  onSubmit,
  pending,
  error,
  testPassword,
}: {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  onSubmit: (values: AuthFormValues) => void;
  pending: boolean;
  error: string | null;
  testPassword?: string;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldUnregister: true,
  });
  const submit: SubmitHandler<AuthFormValues> = (values) => onSubmit(values);
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
        <form
          onSubmit={handleSubmit(submit)}
          noValidate
          className="mt-6 grid gap-4"
        >
          {mode === "login" && testPassword && (
            <Field label="Тестовый аккаунт">
              <Select
                onValueChange={(username) => {
                  if (typeof username !== "string") return;
                  setValue("username", username, { shouldValidate: true });
                  setValue("password", testPassword, {
                    shouldValidate: true,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите аккаунт" />
                </SelectTrigger>
                <SelectContent>
                  {TEST_USERS.map((username) => (
                    <SelectItem key={username} value={username}>
                      {username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
          <Field label="Имя пользователя" error={errors.username?.message}>
            <TextInput
              {...register("username")}
              maxLength={32}
              name="username"
              placeholder="mover"
              autoCapitalize="none"
              spellCheck={false}
              autoComplete="username"
            />
          </Field>
          <p className="-mt-2 text-xs text-[#5C6560]">
            От 3 до 32 символов. Регистр букв не важен.
          </p>
          <Field label="Пароль" error={errors.password?.message}>
            <TextInput
              {...register("password")}
              maxLength={128}
              name="password"
              type="password"
              placeholder="Минимум 8 символов"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />
          </Field>
          {mode === "register" && (
            <Field
              label="Повторите пароль"
              error={errors.confirmPassword?.message}
            >
              <TextInput
                {...register("confirmPassword")}
                maxLength={128}
                name="confirmPassword"
                type="password"
                placeholder="Повторите пароль"
                autoComplete="new-password"
              />
            </Field>
          )}
          <FormError errors={errors} message={error} />
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
