// src/hooks/use-task.ts
"use client";
import useSWR from "swr";
import { TaskType } from "@/types";
import { fetcher } from "@/lib/fetcher";

export function useTask(id?: string) {
  // SWR no hará la petición si el ID es nulo o undefined
  const { data, error, isLoading, mutate } = useSWR<TaskType>(
    id ? `/tasks/${id}` : null,
    fetcher
  );

  return {
    task: data,
    isLoading,
    isError: error,
    mutate,
  };
}
