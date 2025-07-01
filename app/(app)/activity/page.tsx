// app/(app)/activity/page.tsx
"use client";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActivityLog } from "@/hooks/use-activity-log";
import { ActivityLogItem } from "@/components/activity-log/ActivityLogItem";
// import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityLogPage() {
  const { logs, isLoading, isError } = useActivityLog();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Bitácora de Actividad"
        description="Un registro de todas las acciones importantes relacionadas con las tareas."
      />
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading && <p>Cargando actividad...</p>}
          {isError && (
            <p className="text-destructive">Error al cargar la actividad.</p>
          )}
          {logs?.map((log) => (
            <ActivityLogItem key={log._id} log={log} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
