// src/lib/api.ts
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import { addActionToQueue } from "@/lib/sync-queue.service";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Solo cerrar sesión si el usuario TENÍA un token (sesión expirada).
    // Si no hay token, el 401 es esperado (usuario no autenticado) — no redirigir.
    if (error.response?.status === 401) {
      const token = useAuthStore.getState().token;
      if (token) {
        useAuthStore.getState().logout();
        window.location.href = "/";
      }
      return Promise.reject(error);
    }

    // Sin red: encolar mutaciones para sincronizar más tarde
    if (
      !error.response &&
      error.config &&
      ["post", "patch", "delete"].includes(
        (error.config.method ?? "").toLowerCase()
      )
    ) {
      const method = error.config.method.toUpperCase() as
        | "POST"
        | "PATCH"
        | "DELETE";

      // Extraemos la URL relativa (sin la baseURL)
      const url = error.config.url ?? "";

      let body: Record<string, unknown> | undefined;
      try {
        body = error.config.data ? JSON.parse(error.config.data) : undefined;
      } catch {
        body = undefined;
      }

      await addActionToQueue({ type: "API_CALL", payload: { method, url, body } });

      // Rechazamos con un error especial para que los componentes sepan
      const offlineError = new Error("OFFLINE_QUEUED");
      (offlineError as Error & { isOfflineQueued: boolean }).isOfflineQueued = true;
      return Promise.reject(offlineError);
    }

    return Promise.reject(error);
  }
);

export default api;
