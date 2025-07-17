// app/(app)/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, _hasHydrated, router]);

  if (!_hasHydrated) return <FullScreenMsg>Cargando aplicación…</FullScreenMsg>;
  if (!isAuthenticated)
    return <FullScreenMsg>Verificando sesión…</FullScreenMsg>;

  return (
    // Contenedor principal que ocupa toda la pantalla y usa Flexbox
    <div className="flex h-screen bg-muted/40">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        {/* El 'main' ahora solo se encarga del scroll */}
        <main className="flex-1 overflow-y-auto">
          {/* Este 'div' interno controla el ancho y el centrado del contenido */}
          <div className="max-w-7xl mx-auto p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function FullScreenMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      {children}
    </div>
  );
}
