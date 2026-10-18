import {
  deletePushSubscription,
  getVapidPublicKey,
  upsertPushSubscription,
} from "@/api/generated";
import { unwrap } from "@/api/request";
import { API } from "@/configs/consts/api.const";
import { isConnected } from "@/lib/connectivity";

type PushFailure =
  | "unsupported"
  | "permission"
  | "service-worker"
  | "browser-subscription"
  | "server";

export class PushSetupError extends Error {
  constructor(readonly reason: PushFailure) {
    super(reason);
    this.name = "PushSetupError";
  }
}

export function pushSetupErrorMessage(error: unknown) {
  if (!(error instanceof PushSetupError))
    return "Не удалось подключить уведомления. Попробуйте ещё раз.";
  switch (error.reason) {
    case "unsupported":
      return "Этот браузер не поддерживает push-уведомления.";
    case "permission":
      return "Разрешите уведомления для этого сайта в настройках браузера.";
    case "service-worker":
      return "Не удалось запустить уведомления. Обновите страницу и попробуйте снова.";
    case "browser-subscription":
      return "Браузер не смог создать подписку. Проверьте настройки уведомлений сайта.";
    case "server":
      return isConnected()
        ? "Не удалось сохранить подписку на сервере. Попробуйте позже."
        : "Нет связи с сервером. Проверьте подключение и повторите попытку.";
  }
}

function applicationServerKey(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function pushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function registerAppServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator))
    return;
  await navigator.serviceWorker.register(API.PUSH_WORKER, {
    updateViaCache: "none",
  });
}

async function registration() {
  try {
    await registerAppServiceWorker();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) => {
          timeout = setTimeout(
            () => reject(new Error("service worker timeout")),
            15_000,
          );
        }),
      ]);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  } catch {
    throw new PushSetupError("service-worker");
  }
}

function sameKey(current: ArrayBuffer | null, expected: Uint8Array) {
  if (!current || current.byteLength !== expected.byteLength) return false;
  const bytes = new Uint8Array(current);
  return bytes.every((byte, index) => byte === expected[index]);
}

export async function syncPushSubscription() {
  if (!pushSupported() || Notification.permission !== "granted") return;
  const worker = await registration();
  let public_key: string;
  try {
    ({ public_key } = await unwrap(getVapidPublicKey()));
  } catch {
    throw new PushSetupError("server");
  }
  const serverKey = applicationServerKey(public_key);
  let subscription = await worker.pushManager.getSubscription();
  // A subscription made for another server key (old deploy, recreated key)
  // is rejected by the push service: replace it with one for the current key.
  if (
    subscription &&
    !sameKey(subscription.options.applicationServerKey, serverKey)
  ) {
    await subscription.unsubscribe();
    subscription = null;
  }
  if (!subscription) {
    try {
      subscription = await worker.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: serverKey,
      });
    } catch {
      throw new PushSetupError("browser-subscription");
    }
  }
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth)
    throw new PushSetupError("browser-subscription");
  try {
    await unwrap(
      upsertPushSubscription({
        body: {
          endpoint: json.endpoint,
          keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
          expirationTime: json.expirationTime,
        },
      }),
    );
  } catch {
    throw new PushSetupError("server");
  }
}

export async function enablePush() {
  if (!pushSupported()) throw new PushSetupError("unsupported");
  let permission: NotificationPermission;
  try {
    permission = await Notification.requestPermission();
  } catch {
    throw new PushSetupError("permission");
  }
  if (permission !== "granted") throw new PushSetupError("permission");
  await syncPushSubscription();
  return true;
}

export async function disablePush() {
  if (!pushSupported()) return;
  const worker = await navigator.serviceWorker.getRegistration(API.PUSH_WORKER);
  const subscription = await worker?.pushManager.getSubscription();
  if (!subscription) return;
  if (isConnected())
    await unwrap(
      deletePushSubscription({ query: { endpoint: subscription.endpoint } }),
    ).catch(() => undefined);
  await subscription.unsubscribe();
}
