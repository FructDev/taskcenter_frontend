// src/hooks/use-tasks.ts
"use client";
import useSWR from "swr";
import { TaskType, TaskStatus } from "@/types";
import { fetcher } from "@/lib/fetcher";

interface TaskFilters {
  search?: string;
  status?: TaskStatus | TaskStatus[]; // Puede ser un solo estado o un array de estados
  refreshInterval?: number;
}

export function useTasks(filters?: TaskFilters) {
  // URLSearchParams nos ayuda a construir la URL de forma segura
  const queryParams = new URLSearchParams();

  if (filters?.search) {
    queryParams.append("search", filters.search);
  }

  // --- LÓGICA CORREGIDA Y PROFESIONAL ---
  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      // Si es un array, añadimos un parámetro 'status' por cada elemento
      filters.status.forEach((s) => queryParams.append("status", s));
    } else {
      // Si es un solo string, lo añadimos como antes
      queryParams.append("status", filters.status);
    }
  }

  const url = `/tasks?${queryParams.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<TaskType[]>(url, fetcher, {
    refreshInterval: filters?.refreshInterval || 0,
  });

  return {
    tasks: data,
    isLoading,
    isError: error,
    mutate,
  };
}
