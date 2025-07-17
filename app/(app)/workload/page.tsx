// app/(app)/workload/page.tsx
"use client";
import { PageHeader } from "@/components/common/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  //   CardDescription,
} from "@/components/ui/card";
import { useWorkloadReport } from "@/hooks/use-workload-report";
import { Skeleton } from "@/components/ui/skeleton";
// import { UserCheck, AlertTriangle } from "lucide-react";

export default function WorkloadPage() {
  const { workload, isLoading, isError } = useWorkloadReport();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Carga de Trabajo del Equipo"
        description="Visualiza las tareas activas y vencidas asignadas a cada técnico."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          [...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        {isError && (
          <p className="text-destructive col-span-full text-center">
            Error al cargar el informe.
          </p>
        )}
        {workload?.map((item) => (
          <Card key={item.userId}>
            <CardHeader>
              <CardTitle className="text-lg">{item.userName}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-around items-center text-center">
              <div>
                <p className="text-2xl font-bold">{item.activeTasks}</p>
                <p className="text-xs text-muted-foreground">Activas</p>
              </div>
              <div>
                <p
                  className={`text-2xl font-bold ${
                    item.overdueTasks > 0 ? "text-destructive" : ""
                  }`}
                >
                  {item.overdueTasks}
                </p>
                <p className="text-xs text-muted-foreground">Vencidas</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
