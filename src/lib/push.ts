import {
  deletePushSubscription,
  getVapidPublicKey,
  upsertPushSubscription,
} from "@/api/generated";
import { unwrap } from "@/api/request";
import { API } from "@/configs/consts/api.const";

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

async function registration() {
  await navigator.serviceWorker.register(API.PUSH_WORKER);
  return navigator.serviceWorker.ready;
}

export async function syncPushSubscription() {
  if (!pushSupported() || Notification.permission !== "granted") return;
  const worker = await registration();
  let subscription = await worker.pushManager.getSubscription();
  if (!subscription) {
    const { public_key } = await unwrap(getVapidPublicKey());
    subscription = await worker.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey(public_key),
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
  await unwrap(
    deletePushSubscription({ query: { endpoint: subscription.endpoint } }),
  ).catch(() => undefined);
  await subscription.unsubscribe();
}
