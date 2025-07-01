// src/hooks/use-users.ts
"use client";
import useSWR from "swr";
import { UserType } from "@/types";
import { fetcher } from "@/lib/fetcher"; // <-- Importamos el fetcher central

export function useUsers() {
  // Ya no definimos fetcher aquí, simplemente lo usamos
  const { data, error, isLoading, mutate } = useSWR<UserType[]>(
    "/users",
    fetcher
  );
  return { users: data, isLoading, isError: error, mutate };
}
