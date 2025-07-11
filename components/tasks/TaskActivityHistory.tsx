// src/components/tasks/TaskActivityHistory.tsx
"use client";
import { useActivityLog } from "@/hooks/use-activity-log";
import { ActivityLogItem } from "../activity-log/ActivityLogItem";

export function TaskActivityHistory({ taskId }: { taskId: string }) {
  // Usamos nuestro hook mejorado para pedir solo los logs de esta tarea
  const { logs, isLoading } = useActivityLog({ taskId });

  if (isLoading) return <p>Cargando historial...</p>;
  if (!logs || logs.length === 0)
    return (
      <p className="text-sm text-muted-foreground">
        No hay actividad registrada para esta tarea.
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
