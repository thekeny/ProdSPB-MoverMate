"use client";

import { useEffect } from "react";
import {
  pushSupported,
  registerAppServiceWorker,
  syncPushSubscription,
} from "@/lib/push";
import { useAuth } from "@/providers/auth-provider";

export function PushProvider({ children }: { children: React.ReactNode }) {
  const { account } = useAuth();

  useEffect(() => {
    void registerAppServiceWorker().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!account || !pushSupported()) return;
    const permission = Notification.permission;
    const task =
      permission === "granted" ? syncPushSubscription() : Promise.resolve();
    void task.catch(() => undefined);
  }, [account]);

  return children;
}
