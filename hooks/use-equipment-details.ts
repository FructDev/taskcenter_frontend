// src/hooks/use-equipment-details.ts
"use client";
import useSWR from "swr";
import { EquipmentType } from "@/types";
import { fetcher } from "@/lib/fetcher";

export function useEquipmentDetails(id?: string) {
  // SWR no hará la petición si el ID es nulo o undefined
  const { data, error, isLoading, mutate } = useSWR<EquipmentType>(
    id ? `/equipment/${id}` : null,
    fetcher
  );

  return {
    equipment: data,
    isLoading,
    isError: error,
    mutate,
  };
}
