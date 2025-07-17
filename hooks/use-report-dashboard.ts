// src/hooks/use-report-dashboard.ts
"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { ReportDashboardType } from "@/types";

export function useReportDashboard(filters?: Record<string, string>) {
  const queryParams = new URLSearchParams(filters).toString();
  const url = `/reports/dashboard-data?${queryParams}`;

  const { data, error, isLoading, mutate } = useSWR<ReportDashboardType>(
    url,
    fetcher
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}
