// src/hooks/use-my-tasks.ts
"use client";
import useSWR from "swr";
import { TaskType } from "@/types";
import { fetcher } from "@/lib/fetcher";

export function useMyTasks() {
  const { data, error, isLoading, mutate } = useSWR<TaskType[]>(
    "/tasks/my",
    fetcher
  );

  return {
    tasks: data,
    isLoading,
    isError: error,
    mutate,
  };
}
