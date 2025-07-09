// src/hooks/use-task.ts
"use client";
import useSWR from "swr";
import { TaskType } from "@/types";
import { fetcher } from "@/lib/fetcher";

interface TaskFilters {
  search?: string;
  status?: string;
  refreshInterval?: number; // <-- Añadir
}

export function useTask(id?: string, filters?: TaskFilters) {
  // SWR no hará la petición si el ID es nulo o undefined
  const { data, error, isLoading, mutate } = useSWR<TaskType>(
    id ? `/tasks/${id}` : null,
    fetcher,
    { refreshInterval: filters?.refreshInterval || 0 }
  );

  return {
    task: data,
    isLoading,
    isError: error,
    mutate,
  };
}
