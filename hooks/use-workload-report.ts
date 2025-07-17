// src/hooks/use-workload-report.ts
"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { WorkloadReportItem } from "@/types";

export function useWorkloadReport() {
  const { data, error, isLoading } = useSWR<WorkloadReportItem[]>(
    "/reports/workload",
    fetcher
  );
  return { workload: data, isLoading, isError: error };
}
