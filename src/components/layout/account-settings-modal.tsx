"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ApiError } from "@/api/request";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { TextInput } from "@/components/ui/text-input";
import { apiErrorMessage } from "@/lib/api-error";
import {
  changePasswordSchema,
  usernameFormSchema,
} from "@/lib/forms/auth.schema";

export function AccountSettingsModal({
  username,
  onClose,
  onChangeUsername,
  onChangePassword,
  onDeleteAccount,
}: {
  username: string;
  onClose: () => void;
  onChangeUsername: (username: string) => Promise<void>;
  onChangePassword: (values: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const usernameForm = useForm<{ username: string }>({
    resolver: zodResolver(usernameFormSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { username },
  });
  const passwordForm = useForm<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  return (
    <Modal className="max-w-xl" label="Настройки аккаунта" onClose={onClose}>
      <h2 className="text-2xl font-extrabold">Аккаунт</h2>
      <form
        className="mt-5 grid gap-3"
        noValidate
        onSubmit={usernameForm.handleSubmit(
          async ({ username: nextUsername }) => {
            setError(null);
            setNotice(null);
            setPending(true);
            try {
              await onChangeUsername(nextUsername);
              setNotice("Имя пользователя обновлено.");
            } catch (cause) {
              const fieldError =
                cause instanceof ApiError &&
                Object.entries(cause.fields).find(([field]) =>
                  field.toLowerCase().includes("username"),
                );
              if (fieldError) {
                usernameForm.setError("username", { message: fieldError[1] });
              } else {
                setError(apiErrorMessage(cause));
              }
            } finally {
              setPending(false);
            }
          },
        )}
      >
        <Field
          label="Имя пользователя"
          error={usernameForm.formState.errors.username?.message}
        >
          <TextInput
            {...usernameForm.register("username")}
            maxLength={32}
            autoCapitalize="none"
            spellCheck={false}
          />
        </Field>
        <p className="text-xs text-[#5C6560]">
          Имя автоматически приводится к нижнему регистру.
        </p>
        <Button type="submit" variant="outline" disabled={pending}>
          Сохранить имя
        </Button>
      </form>
      <form
        className="mt-6 grid gap-3 border-t border-[#E8E2D5] pt-5"
        noValidate
        onSubmit={passwordForm.handleSubmit(
          async ({ currentPassword, newPassword }) => {
            setError(null);
            setNotice(null);
            setPending(true);
            try {
              await onChangePassword({ currentPassword, newPassword });
            } catch (cause) {
              const fieldError =
                cause instanceof ApiError &&
                Object.entries(cause.fields).find(([field]) =>
                  /current_password|new_password|password/i.test(field),
                );
              if (fieldError) {
                const target = /current_password/i.test(fieldError[0])
                  ? "currentPassword"
                  : "newPassword";
                passwordForm.setError(target, { message: fieldError[1] });
              } else {
                setError(apiErrorMessage(cause));
              }
            } finally {
              setPending(false);
            }
          },
        )}
      >
        <h3 className="font-extrabold">Сменить пароль</h3>
        <Field
          label="Текущий пароль"
          error={passwordForm.formState.errors.currentPassword?.message}
        >
          <TextInput
            {...passwordForm.register("currentPassword")}
            maxLength={128}
            type="password"
            autoComplete="current-password"
          />
        </Field>
        <Field
          label="Новый пароль"
          error={passwordForm.formState.errors.newPassword?.message}
        >
          <TextInput
            {...passwordForm.register("newPassword")}
            maxLength={128}
            type="password"
            autoComplete="new-password"
          />
        </Field>
        <Field
          label="Повторите новый пароль"
          error={passwordForm.formState.errors.confirmPassword?.message}
        >
          <TextInput
            {...passwordForm.register("confirmPassword")}
            maxLength={128}
            type="password"
            autoComplete="new-password"
          />
        </Field>
        <Button type="submit" variant="outline" disabled={pending}>
          Сменить пароль
        </Button>
        <p className="text-xs text-[#5C6560]">
          После смены пароля потребуется войти снова.
        </p>
      </form>
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[#F9E8E2] p-3 text-sm text-[#A84D3C]"
        >
          {error}
        </p>
      )}
      {notice && (
        <output className="mt-4 block rounded-md bg-[#E2E9DD] p-3 text-sm text-[#42664D]">
          {notice}
        </output>
      )}
      <div className="mt-6 border-t border-[#E8E2D5] pt-5">
        <h3 className="font-extrabold text-[#A84D3C]">Удалить аккаунт</h3>
        <p className="mt-2 text-sm text-[#5C6560]">
          Ваши проекты хранятся отдельно в этом браузере и также будут удалены.
        </p>
        <Button
          variant="destructive"
          className="mt-3"
          disabled={pending}
          onClick={() => setConfirmDelete(true)}
        >
          Удалить аккаунт
        </Button>
      </div>
      {confirmDelete && (
        <ConfirmDialog
          title="Удалить аккаунт?"
          description="Это действие нельзя отменить."
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => {
            setError(null);
            setPending(true);
            void onDeleteAccount().catch((cause) => {
              setError(
                cause instanceof ApiError && cause.status === 409
                  ? "Сначала удалите свои проекты, затем повторите удаление аккаунта."
                  : apiErrorMessage(cause),
              );
              setPending(false);
            });
          }}
        />
      )}
    </Modal>
  );
}
