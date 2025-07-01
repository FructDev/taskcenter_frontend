"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export type ReportName = 
  | 'tasks-by-status' 
  | 'tasks-by-criticality'      // Este es el que usa tu gráfico de barras
  | 'tasks-by-type'             // Este es el que usa tu otro gráfico de barras
  | 'average-resolution-time'
  | 'avg-time-by-criticality'   // Añadimos la versión que pide la página
  | 'avg-time-by-type';         // Añadimos la versión que pide la página

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
