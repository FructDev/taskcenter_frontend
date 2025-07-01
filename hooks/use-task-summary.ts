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

export function useTaskSummary() {
  const { data, error, isLoading } = useSWR<TaskSummary>(
    "/tasks/summary",
    fetcher
  );
  return {
    summary: data,
    isLoading,
    isError: error,
  };
}
