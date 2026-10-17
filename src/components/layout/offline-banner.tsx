"use client";

import { WifiOff } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  checkConnectivity,
  getConnectivitySnapshot,
  subscribeConnectivity,
} from "@/lib/connectivity";

const getServerSnapshot = () => true;

export function OfflineBanner() {
  const [checking, setChecking] = useState(false);
  const online = useSyncExternalStore(
    subscribeConnectivity,
    getConnectivitySnapshot,
    getServerSnapshot,
  );
  if (online) return null;

  return (
    <>
      <div aria-hidden="true" className="h-20 sm:h-14" />
      <aside
        aria-live="polite"
        className="no-print fixed inset-x-0 top-0 z-50 flex min-h-12 flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-[#A84D3C] px-4 py-2 text-sm font-medium text-white lg:left-72"
      >
        <WifiOff aria-hidden="true" className="size-4 shrink-0" />
        <span>
          <strong className="font-semibold">Вы офлайн.</strong> Показаны
          последние сохранённые данные. Изменения пока недоступны.
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={checking}
          className="min-h-10 text-white hover:bg-white/15 hover:text-white"
          onClick={() => {
            setChecking(true);
            void checkConnectivity().finally(() => setChecking(false));
          }}
        >
          {checking ? "Проверяем…" : "Проверить связь"}
        </Button>
      </aside>
    </>
  );
}
