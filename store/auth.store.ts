// src/store/auth.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean; // <-- 1. Añadimos el estado de hidratación
  setToken: (token: string) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void; // <-- 2. Añadimos una acción para cambiarlo
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      _hasHydrated: false, // <-- 3. Valor inicial
      setToken: (token) => set({ token, isAuthenticated: true }),
      logout: () => set({ token: null, isAuthenticated: false }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "girasol-auth-storage",
      // 4. Esta función se ejecuta una vez que el estado ha sido cargado
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
