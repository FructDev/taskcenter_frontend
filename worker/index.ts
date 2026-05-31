// worker/index.ts
/// <reference lib="WebWorker" />

import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { getAndClearQueue, getTokenForSW } from "../lib/sync-queue.service";

declare let self: ServiceWorkerGlobalScope;

interface SyncEvent extends Event {
  readonly tag: string;
  readonly lastChance: boolean;
  waitUntil(f: Promise<unknown>): void;
}

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
registerRoute(new NavigationRoute(createHandlerBoundToURL("/")));

// ─── Caché de rutas API ───────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

// Datos de usuario y tareas propias: NetworkFirst con caché de respaldo (1 día)
registerRoute(
  ({ url }) =>
    url.pathname.includes("/auth/profile") ||
    url.pathname.includes("/tasks/my") ||
    url.pathname.includes("/tasks/summary"),
  new NetworkFirst({
    cacheName: "api-user-data",
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 }),
    ],
  })
);

// Lista de tareas con filtros: NetworkFirst (datos cambian con frecuencia)
registerRoute(
  ({ url }) => url.pathname.includes("/tasks") && !url.pathname.includes("/tasks/"),
  new NetworkFirst({
    cacheName: "api-tasks-list",
    plugins: [
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 * 4 }),
    ],
  })
);

// Datos estáticos (ubicaciones, equipos, EPP): StaleWhileRevalidate
registerRoute(
  ({ url }) =>
    url.pathname.includes("/locations") ||
    url.pathname.includes("/equipment") ||
    url.pathname.includes("/ppe-items") ||
    url.pathname.includes("/contractors"),
  new StaleWhileRevalidate({
    cacheName: "api-static-data",
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }),
    ],
  })
);

// Imágenes (fotos de usuarios, partes diarios): CacheFirst
registerRoute(
  ({ url }) =>
    url.hostname.includes("cloudinary") ||
    url.hostname.includes("res.cloudinary"),
  new CacheFirst({
    cacheName: "cloudinary-images",
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }),
    ],
  })
);

// ─── Sincronización en segundo plano ─────────────────────────────────────────

self.addEventListener("sync", (event) => {
  const syncEvent = event as SyncEvent;
  if (syncEvent.tag === "sync-actions") {
    syncEvent.waitUntil(processActionQueue());
  }
});

async function processActionQueue() {
  const actions = await getAndClearQueue();
  if (actions.length === 0) return;

  const token = await getTokenForSW();
  const baseUrl = API_BASE;

  for (const action of actions) {
    try {
      const res = await fetch(`${baseUrl}${action.payload.url}`, {
        method: action.payload.method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: action.payload.body
          ? JSON.stringify(action.payload.body)
          : undefined,
      });

      if (!res.ok) {
        console.error(`[SW] Falló sync para ${action.payload.url}:`, res.status);
      }
    } catch (err) {
      console.error(`[SW] Error de red en sync para ${action.payload.url}:`, err);
    }
  }
}
