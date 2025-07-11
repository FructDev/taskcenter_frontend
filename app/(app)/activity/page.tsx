// app/(app)/activity/page.tsx
"use client";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActivityLog } from "@/hooks/use-activity-log";
import { ActivityLogItem } from "@/components/activity-log/ActivityLogItem";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ActivityLogFilters } from "@/components/activity-log/ActivityLogFilters";
// import { Skeleton } from "@/components/ui/skeleton";

function ActivityLogContent() {
  const searchParams = useSearchParams();
  const filters = Object.fromEntries(searchParams.entries());
  const { logs, isLoading, isError } = useActivityLog(filters);

  if (isLoading)
    return <p className="text-center py-8">Cargando actividad...</p>;
  if (isError)
    return (
      <p className="text-destructive text-center py-8">
        Error al cargar la actividad.
      </p>
    );
  if (!logs || logs.length === 0)
    return (
      <p className="text-muted-foreground text-center py-8">
        No se encontraron registros con los filtros actuales.
      </p>
    );

  return (
    <div className="space-y-6">
      {logs.map((log) => (
        <ActivityLogItem key={log._id} log={log} />
      ))}
    </div>
  );
}

export default function ActivityLogPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Bitácora de Actividad"
        description="Un registro de todas las acciones importantes relacionadas con las tareas."
      />

      {/* Envolvemos los componentes que usan searchParams en <Suspense> */}
      <Suspense fallback={<div>Cargando filtros...</div>}>
        <ActivityLogFilters />
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityLogContent />
          </CardContent>
        </Card>
      </Suspense>
    </div>
  );
}
