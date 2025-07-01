// app/(app)/admin/scheduled-tasks/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useScheduledTaskDetails } from "@/hooks/use-scheduled-task-details";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Bot,
  Edit,
  Trash2,
  Home,
  Calendar,
  HardHat,
  FileText,
  Clock,
} from "lucide-react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/handle-error";
import { TaskDetailItem } from "@/components/tasks/TaskDetailItem";

export default function ScheduledTaskDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { scheduledTask, isLoading, isError, mutate } =
    useScheduledTaskDetails(id);

  const handleToggle = async () => {
    try {
      await api.patch(`/scheduled-tasks/${id}/toggle`);
      toast.success("Estado de la regla actualizado.");
      mutate();
    } catch (error) {
      toast.error("Acción fallida", { description: getErrorMessage(error) });
    }
  };

  const handleRunNow = async () => {
    const toastId = toast.loading("Forzando ejecución de la regla...");
    try {
      const res = await api.post(`/scheduled-tasks/${id}/run-now`);
      toast.success("Ejecución forzada completada.", {
        id: toastId,
        description: res.data.message,
      });
    } catch (error) {
      toast.error("Acción fallida", {
        id: toastId,
        description: getErrorMessage(error),
      });
    }
  };

  if (isLoading)
    return <div className="p-6">Cargando detalles de la regla...</div>;
  if (isError)
    return (
      <div className="p-6 text-destructive">Error al cargar la regla.</div>
    );
  if (!scheduledTask) return <div className="p-6">Regla no encontrada.</div>;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={scheduledTask.name}
        description="Gestiona y monitorea esta regla de automatización."
        actionButton={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleToggle}>
              {scheduledTask.isEnabled ? (
                <Pause className="mr-2 h-4 w-4" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {scheduledTask.isEnabled ? "Pausar Regla" : "Reanudar Regla"}
            </Button>
            <Button onClick={handleRunNow}>
              <Bot className="mr-2 h-4 w-4" />
              Forzar Ejecución
            </Button>
            <Button variant="secondary">
              <Edit className="mr-2 h-4 w-4" /> Editar
            </Button>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
            </Button>
          </div>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Configuración de la Regla</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
          <TaskDetailItem icon={Home} label="Estado">
            {scheduledTask.isEnabled ? (
              <Badge>Habilitada</Badge>
            ) : (
              <Badge variant="secondary">Deshabilitada</Badge>
            )}
          </TaskDetailItem>
          <TaskDetailItem icon={Calendar} label="Frecuencia (Cron)">
            <code>{scheduledTask.schedule}</code>
          </TaskDetailItem>
          <TaskDetailItem icon={HardHat} label="Aplica a Tipo de Equipo">
            <span className="capitalize">
              {scheduledTask.targetEquipmentType.replace(/_/g, " ")}
            </span>
          </TaskDetailItem>
          <TaskDetailItem icon={FileText} label="Usa Plantilla de Tarea">
            {scheduledTask.taskTemplate.name}
          </TaskDetailItem>
          <TaskDetailItem icon={Clock} label="Última Ejecución">
            {scheduledTask.lastRunAt
              ? new Date(scheduledTask.lastRunAt).toLocaleString("es-DO")
              : "Nunca"}
          </TaskDetailItem>
        </CardContent>
      </Card>
      {/* Aquí podría ir un historial de las ejecuciones de esta regla en el futuro */}
    </div>
  );
}
