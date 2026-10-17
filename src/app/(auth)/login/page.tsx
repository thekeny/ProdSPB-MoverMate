"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { AuthScreen } from "@/app/(auth)/login/_components/auth-screen";
import { pages } from "@/configs/paths/pages.path";
import type { AuthMode } from "@/configs/types/auth.type";
import { apiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/providers/auth-provider";
import { useProjects } from "@/providers/projects-provider";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { account, ready, authenticate } = useAuth();
  const { project, ready: projectsReady } = useProjects();

  useEffect(() => {
    if (!ready || !projectsReady || !account) return;
    router.replace(project ? pages.DASHBOARD : pages.PROJECTS);
  }, [account, project, projectsReady, ready, router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const username = String(data.get("username") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const confirmation = form.elements.namedItem(
      "confirmPassword",
    ) as HTMLInputElement | null;
    if (confirmation) {
      confirmation.setCustomValidity(
        password === confirmation.value ? "" : "Пароли должны совпадать.",
      );
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
    }
    setPending(true);
    setError(null);
    try {
      await authenticate({ username, password }, mode);
    } catch (reason) {
      setError(apiErrorMessage(reason));
      setPending(false);
    }
  };

  return (
    <AuthScreen
      mode={mode}
      setMode={(next) => {
        setMode(next);
        setError(null);
      }}
      onSubmit={submit}
      pending={pending}
      error={error}
    />
  );
}
