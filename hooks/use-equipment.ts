// src/hooks/use-equipment.ts
"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { EquipmentType } from "@/types";

export function useEquipment() {
  const { data, error, isLoading, mutate } = useSWR<EquipmentType[]>(
    "/equipment",
    fetcher
  );
  return {
    equipment: data,
    isLoading,
    isError: error,
    mutate,
  };
}
