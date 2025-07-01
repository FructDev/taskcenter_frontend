"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export type ReportName =
  | "tasks-by-status"
  | "tasks-by-criticality"
  | "tasks-by-type"
  | "average-resolution-time";

export function useReport<T>(reportName: ReportName) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    reportName ? `/reports/${reportName}` : null,
    fetcher
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}
