"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/components/auth/LoginForm";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated, logout } = useAuthStore();
  const { user, isError } = useAuth();

  useEffect(() => {
    if (!_hasHydrated) return;

    // Token expirado o inválido: limpiar sesión y mostrar login
    if (isAuthenticated && isError) {
      logout();
      return;
    }

    if (isAuthenticated && user) {
      const dashboardUrl = user.role === "tecnico" ? "/my-tasks" : "/dashboard";
      router.push(dashboardUrl);
    }
  }, [isAuthenticated, user, isError, _hasHydrated, router, logout]);

  if (!_hasHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Cargando sesión...
      </div>
    );
  }

  if (isAuthenticated && !isError) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Verificando sesión...
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40">
      <LoginForm />
    </main>
  );
}
