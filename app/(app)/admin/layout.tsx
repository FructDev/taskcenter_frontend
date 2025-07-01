// app/(app)/admin/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/types";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Roles que tienen permiso para acceder a la sección de administración
  const allowedRoles = [UserRole.ADMIN, UserRole.SUPERVISOR];

  useEffect(() => {
    // Solo actuamos cuando la carga del usuario ha terminado
    if (!isLoading && user) {
      // Si el rol del usuario NO está en la lista de permitidos
      if (!allowedRoles.includes(user.role as UserRole)) {
        // Mostramos una notificación y lo redirigimos
        toast.error("Acceso Denegado", {
          description: "No tienes permisos para acceder a esta sección.",
        });
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, router]);

  // Mientras carga o si el usuario no tiene el rol, mostramos un loader.
  // Esto previene que un usuario sin permisos vea el contenido por un instante.
  if (isLoading || !user || !allowedRoles.includes(user.role as UserRole)) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Verificando permisos...</p>
      </div>
    );
  }

  // Si tiene permiso, simplemente renderizamos la página hija (ej. la página de usuarios)
  // sin añadir NINGÚN layout extra.
  return <>{children}</>;
}
