"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const { user } = useAuth();

  useEffect(() => {
    // Solo redirige después de que la sesión se haya cargado y si el usuario está autenticado
    if (_hasHydrated && isAuthenticated && user) {
      const dashboardUrl = user.role === "tecnico" ? "/my-tasks" : "/dashboard";
      router.push(dashboardUrl);
    }
  }, [isAuthenticated, user, _hasHydrated, router]);

  // Muestra un loader mientras se carga la sesión desde el almacenamiento local
  if (!_hasHydrated || (isAuthenticated && !_hasHydrated)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Cargando sesión...
      </div>
    );
  }

  // Si el usuario está autenticado pero aún no se ha redirigido, muestra otro mensaje
  if (isAuthenticated) {
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
