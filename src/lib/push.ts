import {
  deletePushSubscription,
  getVapidPublicKey,
  upsertPushSubscription,
} from "@/api/generated";
import { unwrap } from "@/api/request";
import { API } from "@/configs/consts/api.const";
import { isConnected } from "@/lib/connectivity";

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
  await registerAppServiceWorker();
  return navigator.serviceWorker.ready;
}

function sameKey(current: ArrayBuffer | null, expected: Uint8Array) {
  if (!current || current.byteLength !== expected.byteLength) return false;
  const bytes = new Uint8Array(current);
  return bytes.every((byte, index) => byte === expected[index]);
}

export async function syncPushSubscription() {
  if (!pushSupported() || Notification.permission !== "granted") return;
  const worker = await registration();
  const { public_key } = await unwrap(getVapidPublicKey());
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
    subscription = await worker.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: serverKey,
    });
  }
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) return;
  await unwrap(
    upsertPushSubscription({
      body: {
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        expirationTime: json.expirationTime,
      },
    }),
  );
}

export async function enablePush() {
  if (!pushSupported()) return false;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;
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
