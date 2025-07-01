// src/hooks/use-task-templates.ts
"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { TaskTemplateType } from "@/types"; // <-- Importamos nuestro nuevo tipo

export function useTaskTemplates() {
  // Reemplazamos 'any[]' con nuestro tipo específico 'TaskTemplateType[]'
  const { data, error, isLoading, mutate } = useSWR<TaskTemplateType[]>(
    "/task-templates",
    fetcher
  );

  return {
    templates: data,
    isLoading,
    isError: error,
    mutate,
  };
}
