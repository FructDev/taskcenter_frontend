// src/hooks/use-contractors.ts
"use client";
import useSWR from "swr";
import { ContractorType } from "@/types";
import { fetcher } from "@/lib/fetcher";

export function useContractors() {
  // Añadimos 'mutate' a lo que desestructuramos de useSWR
  const { data, error, isLoading, mutate } = useSWR<ContractorType[]>(
    "/contractors",
    fetcher
  );

  return {
    contractors: data,
    isLoading,
    isError: error,
    mutate, // <-- Y lo devolvemos aquí
  };
}
