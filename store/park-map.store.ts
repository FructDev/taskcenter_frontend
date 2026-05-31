// store/park-map.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Valores por defecto desde variables de entorno (configurados en Vercel / .env.local)
const DEFAULT_URL = process.env.NEXT_PUBLIC_PARK_MAP_URL ?? null;
const DEFAULT_WIDTH = process.env.NEXT_PUBLIC_PARK_MAP_WIDTH
  ? parseInt(process.env.NEXT_PUBLIC_PARK_MAP_WIDTH, 10)
  : 0;
const DEFAULT_HEIGHT = process.env.NEXT_PUBLIC_PARK_MAP_HEIGHT
  ? parseInt(process.env.NEXT_PUBLIC_PARK_MAP_HEIGHT, 10)
  : 0;

interface ParkMapState {
  imageUrl: string | null;
  imageWidth: number;
  imageHeight: number;
  setMap: (imageUrl: string, width: number, height: number) => void;
  clearMap: () => void;
}

export const useParkMapStore = create<ParkMapState>()(
  persist(
    (set) => ({
      // Si el localStorage está vacío, usa las env vars como fallback
      imageUrl: DEFAULT_URL,
      imageWidth: DEFAULT_WIDTH,
      imageHeight: DEFAULT_HEIGHT,
      setMap: (imageUrl, imageWidth, imageHeight) =>
        set({ imageUrl, imageWidth, imageHeight }),
      clearMap: () =>
        set({
          imageUrl: DEFAULT_URL,
          imageWidth: DEFAULT_WIDTH,
          imageHeight: DEFAULT_HEIGHT,
        }),
    }),
    {
      name: "girasol-park-map",
      // Si el localStorage tiene datos guardados, los usa.
      // Si no (primer acceso en producción), usa los defaults de arriba.
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ParkMapState>;
        // Si el localStorage no tiene imageUrl, usar la del env
        if (!persisted.imageUrl && DEFAULT_URL) {
          return { ...currentState, ...persisted, imageUrl: DEFAULT_URL, imageWidth: DEFAULT_WIDTH, imageHeight: DEFAULT_HEIGHT };
        }
        return { ...currentState, ...persisted };
      },
    }
  )
);
