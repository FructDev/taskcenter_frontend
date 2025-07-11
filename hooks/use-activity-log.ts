// src/hooks/use-activity-log.ts
"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { ActivityLogType } from "@/types";

// El hook ahora acepta un objeto de filtros opcional
export function useActivityLog(filters?: Record<string, string>) {
  const queryParams = new URLSearchParams(filters).toString();
  const url = `/activity-log?${queryParams}`;

  const { data, error, isLoading } = useSWR<ActivityLogType[]>(url, fetcher);
  return { logs: data, isLoading, isError: error };
}
