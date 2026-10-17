import { dehydrate, hydrate, type QueryClient } from "@tanstack/react-query";
import type { Account } from "@/configs/types/account.type";

const DB_NAME = "movermate-offline-v1";
const STORE_NAME = "query-cache";
const ACCOUNT_KEY = "movermate-offline-account-v1";

type CacheSnapshot = ReturnType<typeof dehydrate>;

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function readCachedAccount(): Account | null {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    const account = JSON.parse(raw) as Partial<Account>;
    return typeof account.id === "string" &&
      typeof account.username === "string"
      ? (account as Account)
      : null;
  } catch {
    return null;
  }
}

export function writeCachedAccount(account: Account) {
  try {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  } catch {
    // Offline account recovery is unavailable when local storage is blocked.
  }
}

export async function restoreOfflineCache(
  queryClient: QueryClient,
  accountId: string,
) {
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await openDatabase();
    const snapshot = await new Promise<CacheSnapshot | undefined>(
      (resolve, reject) => {
        const request = db
          .transaction(STORE_NAME, "readonly")
          .objectStore(STORE_NAME)
          .get(accountId);
        request.onsuccess = () => resolve(request.result as CacheSnapshot);
        request.onerror = () => reject(request.error);
      },
    );
    db.close();
    if (snapshot) hydrate(queryClient, snapshot);
  } catch {
    // The application remains usable online when IndexedDB is unavailable.
  }
}

export async function persistOfflineCache(
  queryClient: QueryClient,
  accountId: string,
) {
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction
        .objectStore(STORE_NAME)
        .put(dehydrate(queryClient), accountId);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    db.close();
  } catch {
    // Offline data is best-effort; the online application remains unaffected.
  }
}

export async function clearOfflineCache(accountId?: string | null) {
  try {
    localStorage.removeItem(ACCOUNT_KEY);
  } catch {
    // Nothing to clear when local storage is unavailable.
  }
  if (!accountId || typeof indexedDB === "undefined") return;
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(accountId);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    db.close();
  } catch {
    // Cache cleanup is best-effort when IndexedDB is unavailable.
  }
}
