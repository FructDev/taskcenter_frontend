// src/hooks/use-tasks-by-equipment.ts
"use client";
import useSWR from "swr";
import { TaskType } from "@/types";
import { fetcher } from "@/lib/fetcher";

export function useTasksByEquipment(equipmentId?: string) {
  const { data, error, isLoading } = useSWR<TaskType[]>(
    equipmentId ? `/tasks/by-equipment/${equipmentId}` : null,
    fetcher
  );
  return { tasks: data, isLoading, isError: error };
}
