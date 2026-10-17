"use client";

import {
  type QueryCacheNotifyEvent,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { ApiError } from "@/api/request";
import { QUERY_KEYS } from "@/configs/consts/api.const";
import type { Account } from "@/configs/types/account.type";
import { isConnected } from "@/lib/connectivity";
import { persistOfflineCache } from "@/lib/offline-cache";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 7 * 24 * 60 * 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            networkMode: "online",
            retry: (count, error) =>
              isConnected() &&
              !(error instanceof ApiError && error.status < 500) &&
              count < 2,
          },
        },
      }),
  );
  useEffect(() => {
    let accountId: string | null = null;
    let writeQueue = Promise.resolve();
    const unsubscribe = client.getQueryCache().subscribe((event) => {
      const account = client.getQueryData<Account>(QUERY_KEYS.ME);
      if (account?.id) accountId = account.id;
      if (!accountId || !shouldPersistEvent(event)) return;
      const id = accountId;
      writeQueue = writeQueue.then(() => persistOfflineCache(client, id));
    });
    return unsubscribe;
  }, [client]);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function shouldPersistEvent(event: QueryCacheNotifyEvent) {
  return event.type === "added" || event.type === "updated";
}
