"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { Suspense, useEffect, useState } from "react";
import { AuthScreen } from "@/app/(auth)/login/_components/auth-screen";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { pages } from "@/configs/paths/pages.path";
import { QUERY_PARAMS } from "@/configs/paths/query.path";
import type { AuthMode } from "@/configs/types/auth.type";
import { apiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/providers/auth-provider";
import { useProjects } from "@/providers/projects-provider";

function LoginPageContent() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get(QUERY_PARAMS.NEXT);
  const { account, ready, authenticate } = useAuth();
  const { project, ready: projectsReady } = useProjects();

  useEffect(() => {
    if (!ready || !projectsReady || !account) return;
    router.replace(
      next?.startsWith(`${pages.BOX_TOKEN}/`)
        ? next
        : project
          ? pages.DASHBOARD
          : pages.PROJECTS,
    );
  }, [account, next, project, projectsReady, ready, router]);

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

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginPageContent />
    </Suspense>
  );
}
