// src/hooks/use-auth.ts
"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { UserType } from "@/types";
import { useAuthStore } from "@/store/auth.store";

export function useAuth() {
  const token = useAuthStore((state) => state.token);

  // Solo llamamos a la API si hay un token.
  // Pasar null como key a SWR desactiva la petición completamente.
  const { data, error, isLoading, mutate } = useSWR<UserType>(
    token ? "/auth/profile" : null,
    fetcher
  );

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  };
}
