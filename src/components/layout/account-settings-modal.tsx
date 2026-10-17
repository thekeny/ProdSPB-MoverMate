"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { TextInput } from "@/components/ui/text-input";
import { apiErrorMessage } from "@/lib/api-error";

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

  return (
    <Modal className="max-w-md" label="Настройки аккаунта" onClose={onClose}>
      <h2 className="text-2xl font-extrabold">Аккаунт</h2>
      <form
        className="mt-5 grid gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          setNotice(null);
          const data = new FormData(event.currentTarget);
          const nextUsername = String(data.get("username") ?? "")
            .trim()
            .toLowerCase();
          if (nextUsername.length < 3 || nextUsername.length > 32) {
            setError("Имя пользователя должно содержать от 3 до 32 символов.");
            return;
          }
          setPending(true);
          try {
            await onChangeUsername(nextUsername);
            setNotice("Имя пользователя обновлено.");
          } catch (cause) {
            setError(apiErrorMessage(cause));
          } finally {
            setPending(false);
          }
        }}
      >
        <Field label="Имя пользователя">
          <TextInput
            name="username"
            required
            minLength={3}
            maxLength={32}
            defaultValue={username}
            autoCapitalize="none"
            spellCheck={false}
          />
        </Field>
        <p className="text-xs text-[#68716C]">
          Имя автоматически приводится к нижнему регистру.
        </p>
        <Button type="submit" variant="outline" disabled={pending}>
          Сохранить имя
        </Button>
      </form>
      <form
        className="mt-6 grid gap-3 border-t border-[#E8E2D5] pt-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          setNotice(null);
          const data = new FormData(event.currentTarget);
          const currentPassword = String(data.get("currentPassword") ?? "");
          const newPassword = String(data.get("newPassword") ?? "");
          if (newPassword !== String(data.get("confirmPassword") ?? "")) {
            setError("Новые пароли не совпадают.");
            return;
          }
          setPending(true);
          try {
            await onChangePassword({ currentPassword, newPassword });
          } catch (cause) {
            setError(apiErrorMessage(cause));
            setPending(false);
          }
        }}
      >
        <h3 className="font-extrabold">Сменить пароль</h3>
        <Field label="Текущий пароль">
          <TextInput
            name="currentPassword"
            type="password"
            minLength={8}
            maxLength={128}
            required
            autoComplete="current-password"
          />
        </Field>
        <Field label="Новый пароль">
          <TextInput
            name="newPassword"
            type="password"
            minLength={8}
            maxLength={128}
            required
            autoComplete="new-password"
          />
        </Field>
        <Field label="Повторите новый пароль">
          <TextInput
            name="confirmPassword"
            type="password"
            minLength={8}
            maxLength={128}
            required
            autoComplete="new-password"
          />
        </Field>
        <Button type="submit" variant="outline" disabled={pending}>
          Сменить пароль
        </Button>
        <p className="text-xs text-[#68716C]">
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
        <p className="mt-2 text-sm text-[#68716C]">
          Ваши проекты хранятся отдельно в этом браузере и также будут удалены.
        </p>
        <Button
          variant="destructive"
          className="mt-3"
          disabled={pending}
          onClick={async () => {
            if (
              !window.confirm("Удалить аккаунт? Это действие нельзя отменить.")
            )
              return;
            setError(null);
            setPending(true);
            try {
              await onDeleteAccount();
            } catch (cause) {
              const status = (cause as { status?: number })?.status;
              setError(
                status === 409
                  ? "Сначала удалите свои проекты, затем повторите удаление аккаунта."
                  : apiErrorMessage(cause),
              );
              setPending(false);
            }
          }}
        >
          Удалить аккаунт
        </Button>
      </div>
    </Modal>
  );
}
