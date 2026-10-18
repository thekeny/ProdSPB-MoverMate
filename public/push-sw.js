const CACHE = "movermate-app-v4";
const CACHE_PREFIX = "movermate-app-";
const APP_SHELL = [
  "/",
  "/login",
  "/dashboard",
  "/boxes",
  "/plan",
  "/labels",
  "/progress",
  "/icon.png",
  "/logo.png",
  "/favicon.png",
];
const APP_ROUTES = new Set(
  APP_SHELL.filter((path) => path === "/" || !path.includes(".")),
);

function readPayload(event) {
  if (!event.data) return {};
  try {
    const parsed = event.data.json();
    if (parsed && typeof parsed === "object") return parsed;
    return { body: String(parsed) };
  } catch {
    return { body: event.data.text() };
  }
}

function rscCacheKey(url) {
  const cacheUrl = new URL(url);
  cacheUrl.searchParams.delete("_rsc");
  return new Request(cacheUrl);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(async () => {
        const cache = await caches.open(CACHE);
        const responses = await Promise.all(
          APP_SHELL.filter(
            (path) => path.endsWith("/") || !path.includes("."),
          ).map((path) => cache.match(path)),
        );
        const pages = await Promise.all(
          responses.map((response) => response?.text() ?? ""),
        );
        const assets = new Set();
        for (const page of pages)
          for (const match of page.matchAll(/(?:src|href)="([^"]+)"/g)) {
            // Attribute values are HTML-escaped: "&amp;" breaks /_next/image (400).
            const url = match[1]?.replaceAll("&amp;", "&");
            if (
              url?.startsWith("/_next/static/") ||
              url?.startsWith("/_next/image?")
            )
              assets.add(url);
          }
        // Best effort: one missing asset must not fail the install, or the
        // worker never activates and push subscription hangs on `ready`.
        await Promise.allSettled([...assets].map((asset) => cache.add(asset)));
      }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                (key.startsWith(CACHE_PREFIX) || key === "movermate-v3") &&
                key !== CACHE,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/"))
    return;

  const isNextDataRequest =
    request.headers.has("RSC") ||
    request.headers.has("Next-Router-State-Tree") ||
    request.headers.has("Next-Router-Prefetch") ||
    url.searchParams.has("_rsc");

  if (isNextDataRequest) {
    if (!APP_ROUTES.has(url.pathname)) return;
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok)
            await caches
              .open(CACHE)
              .then((cache) => cache.put(rscCacheKey(url), response.clone()));
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE);
          return (
            (await cache.match(rscCacheKey(url), { ignoreVary: true })) ??
            (await cache.match(new Request(`${url.origin}${url.pathname}`), {
              ignoreSearch: true,
              ignoreVary: true,
            })) ??
            new Response(null, { status: 503, statusText: "Offline" })
          );
        }),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            await caches
              .open(CACHE)
              .then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() =>
          caches
            .open(CACHE)
            .then((cache) => cache.match(request))
            .then((cached) =>
              cached
                ? cached
                : caches
                    .open(CACHE)
                    .then((cache) =>
                      cache.match(request, { ignoreSearch: true }),
                    ),
            )
            .then((cached) =>
              cached
                ? cached
                : caches.open(CACHE).then((cache) => cache.match("/")),
            ),
        ),
    );
    return;
  }

  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/_next/image" ||
    /\.(?:css|js|mjs|woff2?|ttf|otf|png|jpe?g|webp|avif|svg|ico)$/iu.test(
      url.pathname,
    );
  if (!isStaticAsset) return;

  event.respondWith(
    caches
      .open(CACHE)
      .then((cache) => cache.match(request))
      .then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
  );
});

self.addEventListener("push", (event) => {
  const payload = readPayload(event);
  const nested = payload.notification ?? {};
  const title = payload.title || nested.title || "MoverMate";
  const options = {
    body: payload.body || payload.message || nested.body || "",
    icon: "/icon.png",
    badge: "/favicon.png",
    data: { url: payload.url || nested.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/", self.location.origin)
    .href;
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const open = clients.find((client) => client.url === url);
        if (open) return open.focus();
        return self.clients.openWindow(url);
      }),
  );
});
