// src/hooks/use-activity-log.ts
"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { ActivityLogType } from "@/types"; // Añadiremos este tipo ahora

export function useActivityLog() {
  const { data, error, isLoading } = useSWR<ActivityLogType[]>(
    "/activity-log",
    fetcher
  );
  return {
    logs: data,
    isLoading,
    isError: error,
  };
}
