// store/park-map.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

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
      imageUrl: null,
      imageWidth: 0,
      imageHeight: 0,
      setMap: (imageUrl, imageWidth, imageHeight) =>
        set({ imageUrl, imageWidth, imageHeight }),
      clearMap: () => set({ imageUrl: null, imageWidth: 0, imageHeight: 0 }),
    }),
    { name: "girasol-park-map" }
  )
);
