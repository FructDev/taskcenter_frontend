// worker/index.ts

/// <reference lib="WebWorker" />

import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { getAndClearQueue } from "../lib/sync-queue.service";

// Le decimos a TypeScript que 'self' es un ServiceWorkerGlobalScope
declare let self: ServiceWorkerGlobalScope;

// Definimos la interfaz para el evento 'sync' para evitar usar 'any'
interface SyncEvent extends Event {
  readonly tag: string;
  readonly lastChance: boolean;
  waitUntil(f: Promise<unknown>): void;
}

// --- LÓGICA DEL SERVICE WORKER ---

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
registerRoute(new NavigationRoute(createHandlerBoundToURL("/")));

// --- LÓGICA DE SINCRONIZACIÓN EN SEGUNDO PLANO ---

self.addEventListener("sync", (event) => {
  // Ahora usamos nuestra interfaz SyncEvent, que es segura
  const syncEvent = event as SyncEvent;
  if (syncEvent.tag === "sync-actions") {
    syncEvent.waitUntil(processActionQueue());
  }
});

async function processActionQueue() {
  console.log("Service Worker: Procesando cola de acciones...");
  try {
    const actions = await getAndClearQueue();
    if (actions.length === 0) {
      console.log("Service Worker: No hay acciones en la cola.");
      return;
    }

    console.log(`Service Worker: Sincronizando ${actions.length} acciones.`);

    for (const action of actions) {
      try {
        const response = await fetch(action.payload.url, {
          method: action.payload.method,
          headers: {
            "Content-Type": "application/json",
            // NOTA: La autenticación para el modo offline es un tema muy avanzado.
            // Por ahora, asumimos que los endpoints son accesibles si el service worker se ejecuta.
          },
          body: action.payload.body
            ? JSON.stringify(action.payload.body)
            : undefined,
        });

        if (!response.ok) {
          console.error(
            `Service Worker: Falló la acción sincronizada para ${action.payload.url}`,
            await response.text()
          );
        } else {
          console.log(
            `Service Worker: Acción sincronizada con éxito para ${action.payload.url}`
          );
        }
      } catch (error) {
        console.error(
          `Service Worker: Error de red al intentar sincronizar la acción ${action.payload.url}`,
          error
        );
        // En una implementación más avanzada, podríamos devolver la acción a la cola si falla.
      }
    }
    console.log("Service Worker: Procesamiento de la cola finalizado.");
  } catch (dbError) {
    console.error(
      "Service Worker: Error al acceder a la base de datos local (IndexedDB).",
      dbError
    );
  }
}
