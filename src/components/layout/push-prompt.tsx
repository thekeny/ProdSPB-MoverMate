"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { enablePush, pushSupported } from "@/lib/push";

const subscribe = () => () => {};

export function PushPrompt() {
  const [dismissed, setDismissed] = useState(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const granted = useSyncExternalStore(
    subscribe,
    () => !pushSupported() || Notification.permission === "granted",
    () => true,
  );
  if (granted || dismissed) return null;
  return (
    <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-4">
      <p className="text-sm">
        Включите уведомления, чтобы получать напоминания о переезде.
      </p>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => setDismissed(true)}>
          Не сейчас
        </Button>
        <Button
          disabled={pending}
          onClick={() => {
            setPending(true);
            setFailed(false);
            void enablePush()
              .then((enabled) => setFailed(!enabled))
              .catch(() => setFailed(true))
              .finally(() => setPending(false));
          }}
        >
          Включить
        </Button>
      </div>
      {failed && (
        <p role="alert" className="basis-full text-xs font-bold text-[#A84D3C]">
          Не удалось включить уведомления. Разрешите их в браузере и повторите.
        </p>
      )}
    </div>
  );
}
