// src/components/reports/TopTechniciansTable.tsx
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "../ui/skeleton";

interface TechnicianData {
  userId: string;
  userName: string;
  count: number;
}

interface TopTechniciansTableProps {
  data?: TechnicianData[];
  isLoading: boolean;
  onFilterChange: (filter: { assignedTo: string }) => void;
}

export function TopTechniciansTable({
  data,
  isLoading,
  onFilterChange,
}: TopTechniciansTableProps) {
  if (isLoading) {
    return <Skeleton className="h-[350px]" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productividad del Equipo</CardTitle>
        <CardDescription>
          Técnicos con más tareas completadas en los últimos 30 días.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data?.map((tech, index) => (
            <div
              key={tech.userId || index} // Usamos el index como fallback por si no hay userId
              className="flex items-center cursor-pointer hover:bg-muted/50 p-2 rounded-md"
              // Si no hay ID de usuario, no podemos filtrar, así que no hacemos nada al hacer clic
              onClick={() =>
                tech.userId && onFilterChange({ assignedTo: tech.userId })
              }
            >
              <div className="flex items-center gap-4">
                <span className="font-bold text-lg text-muted-foreground">
                  {index + 1}
                </span>
                <Avatar className="h-9 w-9">
                  {/* Mostramos 'UE' (Usuario Eliminado) como fallback */}
                  <AvatarFallback>
                    {tech.userName?.substring(0, 2).toUpperCase() || "UE"}
                  </AvatarFallback>
                </Avatar>
                {/* Mostramos 'Usuario Eliminado' si no hay nombre */}
                <p className="font-medium">
                  {tech.userName || "Usuario Eliminado"}
                </p>
              </div>
              <div className="ml-auto font-semibold">{tech.count} tareas</div>
            </div>
          ))}
          {(!data || data.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay datos de tareas completadas recientemente.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
