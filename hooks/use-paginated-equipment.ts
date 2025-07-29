// src/hooks/use-paginated-equipment.ts
"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { EquipmentType } from "@/types";

interface PaginatedResponse {
  data: EquipmentType[];
  total: number;
}

interface EquipmentFilters {
  page: number;
  limit: number;
  search: string;
  type: string;
}

export function usePaginatedEquipment({
  page,
  limit,
  search,
  type,
}: EquipmentFilters) {
  // --- LÓGICA DE CONSTRUCCIÓN DE URL CORREGIDA ---
  const queryParams = new URLSearchParams();

  // Siempre añadimos página y límite
  queryParams.append("page", String(page));
  queryParams.append("limit", String(limit));

  // Solo añadimos 'search' si no está vacío
  if (search && search.trim().length > 0) {
    queryParams.append("search", search);
  }

  // Solo añadimos 'type' si no está vacío
  if (type && type.trim().length > 0) {
    queryParams.append("type", type);
  }
  // --- FIN DE LA LÓGICA CORREGIDA ---

  const url = `/equipment?${queryParams.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse>(
    url,
    fetcher
  );

  console.log(data, "Paginated Equipment Data");

  return {
    equipment: data?.data || [],
    total: data?.total || 0,
    isLoading,
    isError: error,
    mutate,
  };
}
