// src/hooks/use-task-summary.ts
"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface TaskSummary {
  pending: number;
  inProgress: number;
  highCriticality: number;
  overdue: number;
}

export function useTaskSummary(refreshInterval = 0) {
  const { data, error, isLoading } = useSWR<TaskSummary>(
    "/tasks/summary",
    fetcher,
    { refreshInterval }
  );
  return {
    summary: data,
    isLoading,
    isError: error,
  };
}
