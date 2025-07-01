// app/(app)/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();

  useEffect(() => {
    // La lógica de redirección se mantiene, se ejecutará si !isAuthenticated
    if (hasHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, hasHydrated, router]);

  // --- LÓGICA DE RENDERIZADO CORREGIDA ---

  // 1. Mientras el estado se carga desde el localStorage, mostramos un loader.
  if (!hasHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Cargando aplicación...
      </div>
    );
  }

  // 2. Si el estado ya cargó Y el usuario ESTÁ autenticado, mostramos el layout.
  if (isAuthenticated) {
    return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <div className="flex flex-col">
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {children}
          </main>
        </div>
        {/* El Toaster puede vivir aquí también para las notificaciones internas */}
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  // 3. Si el estado ya cargó PERO el usuario NO está autenticado,
  // no devolvemos nada (o un loader) mientras el useEffect hace la redirección.
  return (
    <div className="flex h-screen w-full items-center justify-center">
      Verificando sesión...
    </div>
  );
}
