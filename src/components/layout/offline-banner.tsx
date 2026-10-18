"use client";

import { Tooltip } from "@base-ui/react/tooltip";
import { WifiOff } from "lucide-react";
import { useSyncExternalStore } from "react";
import {
  checkConnectivity,
  getConnectivitySnapshot,
  subscribeConnectivity,
} from "@/lib/connectivity";

const getServerSnapshot = () => true;

export function OfflineBanner() {
  const online = useSyncExternalStore(
    subscribeConnectivity,
    getConnectivitySnapshot,
    getServerSnapshot,
  );
  if (online) return null;

  return (
    <>
      <div aria-hidden="true" className="h-8 lg:h-0" />
      <aside
        aria-live="polite"
        className="no-print fixed inset-x-0 top-0 z-50 flex h-8 items-center justify-center bg-[#A84D3C] px-3 text-sm font-medium text-white lg:left-72"
      >
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger
              delay={150}
              aria-label="Вы оффлайн. Данные закешированы, доступен только просмотр. Нажмите, чтобы проверить связь"
              className="m-2 inline-flex h-8 items-center gap-2 rounded-md px-2 text-sm font-medium text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
              onClick={() => void checkConnectivity()}
            >
              <WifiOff aria-hidden="true" className="size-4 shrink-0" />
              <span>Вы оффлайн</span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner
                side="bottom"
                sideOffset={6}
                className="z-[60]s"
              >
                <Tooltip.Popup className="max-w-[calc(100vw-24px)] rounded-lg bg-[#1D2923] px-3 py-2 text-center text-xs font-normal leading-5 text-white sm:max-w-xs">
                  Показаны последние сохранённые данные.{" "}
                  <br className="sm:hidden" />
                  Изменения пока недоступны
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </aside>
    </>
  );
}
