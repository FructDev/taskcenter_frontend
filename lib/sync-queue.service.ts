// src/lib/services/sync-queue.service.ts
import Dexie, { Table } from "dexie";

// Definimos la estructura de una acción que guardaremos
export interface SyncAction {
  id?: number;
  type: "API_CALL"; // Por ahora solo manejamos llamadas a la API
  payload: {
    method: "POST" | "PATCH" | "DELETE";
    url: string;
    body?: Record<string, unknown>;
  };
  timestamp: number;
}

// Creamos la clase de nuestra base de datos IndexedDB
class SyncQueueDatabase extends Dexie {
  public actions!: Table<SyncAction, number>;

  public constructor() {
    super("GirasolAppSyncQueue"); // Nombre de la base de datos
    this.version(1).stores({
      // Definimos una 'tabla' llamada 'actions' con un id auto-incremental
      actions: "++id, type, timestamp",
    });
  }
}

const db = new SyncQueueDatabase();

// Función para AÑADIR una acción a la cola
export const addActionToQueue = async (
  action: Omit<SyncAction, "timestamp" | "id">
) => {
  const syncAction: SyncAction = { ...action, timestamp: Date.now() };

  // Si el navegador soporta Background Sync, registramos un evento de sincronización.
  // Esto le dice al Service Worker que tiene trabajo pendiente.
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register("sync-actions");
    } catch (error) {
      console.error(
        "Error al registrar la sincronización en segundo plano:",
        error
      );
    }
  }

  // Añadimos la acción a nuestra base de datos local
  return db.actions.add(syncAction);
};

// Función para OBTENER y LIMPIAR todas las acciones de la cola
export const getAndClearQueue = async (): Promise<SyncAction[]> => {
  const actions = await db.actions.orderBy("timestamp").toArray();
  if (actions.length > 0) {
    await db.actions.clear();
  }
  return actions;
};
