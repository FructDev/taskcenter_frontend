// src/store/auth.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  saveTokenForSW,
  clearTokenForSW,
} from "@/lib/sync-queue.service";

type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setToken: (token) => {
        // Guardamos el token en IndexedDB para que el SW pueda usarlo en sync
        if (typeof window !== "undefined") {
          saveTokenForSW(token).catch(() => {});
        }
        set({ token, isAuthenticated: true });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          clearTokenForSW().catch(() => {});
        }
        set({ token: null, isAuthenticated: false });
      },
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "girasol-auth-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Re-sincronizar el token en IndexedDB al rehidratar
          if (state.token && typeof window !== "undefined") {
            saveTokenForSW(state.token).catch(() => {});
          }
          state.setHasHydrated(true);
        }
      },
    }
  )
);
