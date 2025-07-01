// src/hooks/use-locations.ts
"use client";
import useSWR from "swr";
import { LocationType } from "@/types";
import { fetcher } from "@/lib/fetcher";

export function useLocations() {
  // Añadimos 'mutate' a lo que desestructuramos y devolvemos
  const { data, error, isLoading, mutate } = useSWR<LocationType[]>(
    "/locations",
    fetcher
  );

  return {
    locations: data,
    isLoading,
    isError: error,
    mutate,
  };
}
