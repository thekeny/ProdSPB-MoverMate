"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMoverMate } from "@/components/movermate/store";
import { pages } from "@/configs/paths/pages.path";

export default function HomePage() {
  const router = useRouter();
  const { ready, account, project } = useMoverMate();

  useEffect(() => {
    if (!ready) return;
    router.replace(
      account ? (project ? pages.DASHBOARD : pages.PROJECTS) : pages.LOGIN,
    );
  }, [account, project, ready, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <output className="text-sm font-bold text-foreground" aria-live="polite">
        Загрузка…
      </output>
    </main>
  );
}
