// src/hooks/use-active-map.ts
"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { MapType } from "@/types";

export function useActiveMap() {
  const { data, error, isLoading } = useSWR<MapType>("/maps/active", fetcher);
  return {
    activeMap: data,
    isLoading,
    isError: error,
  };
}
