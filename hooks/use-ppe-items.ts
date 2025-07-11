// src/hooks/use-ppe-items.ts
"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { PpeItemType } from "@/types";

export function usePpeItems() {
  const { data, error, isLoading, mutate } = useSWR<PpeItemType[]>(
    "/ppe-items",
    fetcher
  );

  return {
    ppeItems: data,
    isLoading,
    isError: error,
    mutate,
  };
}
