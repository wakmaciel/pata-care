/* PataCare — service worker simples para uso offline.
   Estratégia: network-first para o "casco" do app (HTML/JS/manifest), assim
   atualizações do site chegam ao abrir o app, sem precisar reinstalar.
   Cache-first apenas para ícones/imagens, que raramente mudam.
   Os dados dos pets ficam no IndexedDB, que o service worker não precisa tocar. */
// ⚠️ BUILD_VERSION é substituído automaticamente pelo GitHub Actions a cada deploy.

const CACHE_NAME = "patacare-cache-__BUILD_VERSION__";
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./icons/favicon-192.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

// Ao tocar num aviso do sistema, traz o PataCare para frente já nos Lembretes.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL((event.notification.data && event.notification.data.url) || "#/lembretes", self.registration.scope).href;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((client) => client.url.split("#")[0] === targetUrl.split("#")[0]);
      if (existing) return existing.focus().then(() => existing.navigate(targetUrl));
      return clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  // Não mexe em chamadas de fontes/externas; deixa passar direto pela rede.
  if (new URL(event.request.url).origin !== location.origin) return;

  const dest = event.request.destination;
  const isShell = event.request.mode === "navigate" || dest === "script" || dest === "style" || dest === "manifest";

  if (isShell) {
    // Network-first: busca a versão mais nova; cache só quando estiver offline.
    // "no-cache" força revalidação no servidor, ignorando o cache HTTP do GitHub Pages.
    event.respondWith(
      fetch(event.request, { cache: "no-cache" }).then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() =>
        caches.match(event.request).then((cached) => cached || (event.request.mode === "navigate" ? caches.match("./index.html") : undefined))
      )
    );
    return;
  }

  // Ícones/imagens: cache-first (raramente mudam).
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});
