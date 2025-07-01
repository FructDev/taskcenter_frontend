// src/hooks/use-scheduled-tasks.ts
"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { ScheduledTaskType } from "@/types";

export function useScheduledTasks() {
  const { data, error, isLoading, mutate } = useSWR<ScheduledTaskType[]>(
    "/scheduled-tasks",
    fetcher
  );
  return { scheduledTasks: data, isLoading, isError: error, mutate };
}
