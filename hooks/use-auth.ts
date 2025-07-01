// src/hooks/use-auth.ts
"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { UserType } from "@/types";

export function useAuth() {
  // Usamos el endpoint que ya creamos en el backend
  const { data, error, isLoading, mutate } = useSWR<UserType>(
    "/auth/profile",
    fetcher
  );

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  };
}
