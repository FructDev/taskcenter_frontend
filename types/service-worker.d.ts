// src/types/service-worker.d.ts

// Le decimos a TypeScript cómo es un SyncManager
interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

// Extendemos la interfaz global de ServiceWorkerRegistration para que incluya la propiedad 'sync'
interface ServiceWorkerRegistration {
  readonly sync: SyncManager;
}
