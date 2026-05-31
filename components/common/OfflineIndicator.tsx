"use client";
import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { flushQueue, getQueueCount } from "@/lib/sync-queue.service";
import { mutate } from "swr";

type SyncState = "idle" | "syncing" | "done";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncState, setSyncState] = useState<SyncState>("idle");

  // Actualizar contador de acciones pendientes
  const refreshCount = async () => {
    const count = await getQueueCount();
    setPendingCount(count);
  };

  useEffect(() => {
    // Estado inicial
    setIsOnline(navigator.onLine);
    refreshCount();

    const handleOnline = async () => {
      setIsOnline(true);
      await refreshCount();

      // Si había acciones en cola, sincronizar
      const count = await getQueueCount();
      if (count > 0) {
        setSyncState("syncing");
        const { synced, failed } = await flushQueue();

        if (synced > 0) {
          // Revalidar todos los datos para reflejar los cambios sincronizados
          await mutate(() => true, undefined, { revalidate: true });
        }

        if (failed === 0 && synced > 0) {
          setSyncState("done");
          toast.success(`${synced} acción${synced > 1 ? "es" : ""} sincronizada${synced > 1 ? "s" : ""} con éxito.`);
          setTimeout(() => setSyncState("idle"), 3000);
        } else if (failed > 0) {
          setSyncState("idle");
          toast.error(`${failed} acción${failed > 1 ? "es" : ""} no se pudo${failed > 1 ? "ieron" : ""} sincronizar.`);
        } else {
          setSyncState("idle");
        }

        await refreshCount();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      refreshCount();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Actualizar el contador periódicamente cuando está offline
  useEffect(() => {
    if (!isOnline) {
      const interval = setInterval(refreshCount, 3000);
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  // Sin conexión
  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-destructive text-destructive-foreground px-4 py-2 text-sm font-medium shadow-lg animate-in slide-in-from-bottom-4">
        <WifiOff className="h-4 w-4 shrink-0" />
        <span>Sin conexión</span>
        {pendingCount > 0 && (
          <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
            {pendingCount} pendiente{pendingCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
    );
  }

  // Sincronizando
  if (syncState === "syncing") {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-medium shadow-lg animate-in slide-in-from-bottom-4">
        <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
        <span>Sincronizando…</span>
      </div>
    );
  }

  // Sincronizado
  if (syncState === "done") {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-green-600 text-white px-4 py-2 text-sm font-medium shadow-lg animate-in slide-in-from-bottom-4">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>Todo sincronizado</span>
      </div>
    );
  }

  return null;
}
