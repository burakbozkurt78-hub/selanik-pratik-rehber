const CACHE_NAME = "eda-selanik-v1";
const PRECACHE_URLS = ["./", "./index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== "eda-wallet-v1").map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request, { ignoreSearch: true }).then((cached) => {
        const net = fetch(event.request)
          .then((res) => {
            if (res && res.ok && res.type === "basic") {
              cache.put(event.request, res.clone());
            }
            return res;
          })
          .catch(() => cached || cache.match("./index.html") || cache.match("./"));
        return cached || net;
      })
    )
  );
});
