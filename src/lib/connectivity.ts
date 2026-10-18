import { onlineManager } from "@tanstack/react-query";

const listeners = new Set<() => void>();
let connected = typeof navigator === "undefined" || navigator.onLine;

function setConnected(value: boolean) {
  if (connected === value) return;
  connected = value;
  onlineManager.setOnline(value);
  for (const listener of listeners) listener();
}

if (typeof window !== "undefined") {
  onlineManager.setOnline(navigator.onLine);
  onlineManager.setEventListener((setOnline) => {
    const update = () => {
      const value = navigator.onLine;
      setConnected(value);
      setOnline(value);
    };
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    update();
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  });
}

export function isConnected() {
  return connected;
}

export function markConnected() {
  setConnected(true);
}

export function markDisconnected() {
  setConnected(false);
}

export async function checkConnectivity() {
  try {
    await fetch("/api/v1/push/vapid-public-key", { cache: "no-store" });
    markConnected();
    return true;
  } catch {
    markDisconnected();
    return false;
  }
}

export function subscribeConnectivity(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getConnectivitySnapshot() {
  return connected;
}
