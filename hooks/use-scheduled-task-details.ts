// src/hooks/use-scheduled-task-details.ts
"use client";
import useSWR from "swr";
import { ScheduledTaskType } from "@/types";
import { fetcher } from "@/lib/fetcher";

export function useScheduledTaskDetails(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ScheduledTaskType>(
    id ? `/scheduled-tasks/${id}` : null,
    fetcher
  );

  return {
    scheduledTask: data,
    isLoading,
    isError: error,
    mutate,
  };
}
