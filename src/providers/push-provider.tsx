"use client";

import { useEffect } from "react";
import { enablePush, syncPushSubscription } from "@/lib/push";
import { useAuth } from "@/providers/auth-provider";

export function PushProvider({ children }: { children: React.ReactNode }) {
  const { account } = useAuth();

  useEffect(() => {
    if (!account) return;
    const permission = Notification.permission;
    const task =
      permission === "granted"
        ? syncPushSubscription()
        : permission === "default"
          ? enablePush()
          : Promise.resolve(false);
    void task.catch(() => undefined);
  }, [account]);

  return children;
}
