// src/lib/sync-queue.service.ts
import Dexie, { Table } from "dexie";

export interface SyncAction {
  id?: number;
  type: "API_CALL";
  payload: {
    method: "POST" | "PATCH" | "DELETE";
    url: string;
    body?: Record<string, unknown>;
  };
  timestamp: number;
}

class SyncQueueDatabase extends Dexie {
  public actions!: Table<SyncAction, number>;
  public keyval!: Table<{ key: string; value: string }, string>;

  public constructor() {
    super("GirasolAppSyncQueue");
    this.version(2).stores({
      actions: "++id, type, timestamp",
      keyval: "key",
    });
  }
}

const db = new SyncQueueDatabase();

// ─── Token storage (para que el SW pueda autenticarse) ────────────────────────

export const saveTokenForSW = async (token: string) => {
  await db.keyval.put({ key: "jwt_token", value: token });
};

export const getTokenForSW = async (): Promise<string | null> => {
  const record = await db.keyval.get("jwt_token");
  return record?.value ?? null;
};

export const clearTokenForSW = async () => {
  await db.keyval.delete("jwt_token");
};

// ─── Cola de sincronización ───────────────────────────────────────────────────

export const addActionToQueue = async (
  action: Omit<SyncAction, "timestamp" | "id">
) => {
  const syncAction: SyncAction = { ...action, timestamp: Date.now() };
  await db.actions.add(syncAction);

  // Registrar Background Sync si el navegador lo soporta
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register("sync-actions");
    } catch {
      // Background Sync no disponible — se hará sync manual al volver online
    }
  }
};

export const getAndClearQueue = async (): Promise<SyncAction[]> => {
  const actions = await db.actions.orderBy("timestamp").toArray();
  if (actions.length > 0) {
    await db.actions.clear();
  }
  return actions;
};

export const getQueueCount = async (): Promise<number> => {
  return db.actions.count();
};

// ─── Flush manual (para navegadores sin Background Sync) ─────────────────────

export const flushQueue = async (): Promise<{ synced: number; failed: number }> => {
  const actions = await getAndClearQueue();
  if (actions.length === 0) return { synced: 0, failed: 0 };

  const token = await getTokenForSW();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

  let synced = 0;
  let failed = 0;
  const failed_actions: SyncAction[] = [];

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

      if (res.ok) {
        synced++;
      } else {
        failed++;
        failed_actions.push(action);
      }
    } catch {
      failed++;
      failed_actions.push(action);
    }
  }

  // Devuelve las acciones fallidas a la cola
  if (failed_actions.length > 0) {
    await db.actions.bulkAdd(failed_actions);
  }

  return { synced, failed };
};
