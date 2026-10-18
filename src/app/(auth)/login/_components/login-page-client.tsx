"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthScreen } from "@/app/(auth)/login/_components/auth-screen";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { pages } from "@/configs/paths/pages.path";
import { QUERY_PARAMS } from "@/configs/paths/query.path";
import type { AuthMode } from "@/configs/types/auth.type";
import { apiErrorMessage } from "@/lib/api-error";
import type { AuthFormValues } from "@/lib/forms/auth.schema";
import { useAuth } from "@/providers/auth-provider";
import { useProjects } from "@/providers/projects-provider";

function LoginPageContent({ testPassword }: { testPassword?: string }) {
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

  const submit = async ({ username, password }: AuthFormValues) => {
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
      setMode={(nextMode) => {
        setMode(nextMode);
        setError(null);
      }}
      onSubmit={(values) => void submit(values)}
      pending={pending}
      error={error}
      testPassword={testPassword}
    />
  );
}

export function LoginPageClient({ testPassword }: { testPassword?: string }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginPageContent testPassword={testPassword} />
    </Suspense>
  );
}
