// src/hooks/use-tasks.ts
"use client";
import useSWR from "swr";
import { TaskType } from "@/types";
import { fetcher } from "@/lib/fetcher";

interface TaskFilters {
  search?: string;
  status?: string;
}

export function useTasks(filters?: TaskFilters) {
  let query = "";

  if (filters) {
    // Creamos un objeto solo con los filtros que tienen un valor real
    const activeFilters = Object.entries(filters).reduce(
      (acc, [key, value]) => {
        if (value) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, string>
    );

    query = new URLSearchParams(activeFilters).toString();
  }

  const url = query ? `/tasks?${query}` : "/tasks";

  const { data, error, isLoading, mutate } = useSWR<TaskType[]>(url, fetcher);

  return {
    tasks: data,
    isLoading,
    isError: error,
    mutate,
  };
}
