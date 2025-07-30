"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/handle-error";

import { useScheduledTaskDetails } from "@/hooks/use-scheduled-task-details";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskDetailItem } from "@/components/tasks/TaskDetailItem";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScheduledTaskForm } from "@/components/scheduled-tasks/ScheduledTaskForm";
import {
  Play,
  Pause,
  Bot,
  Edit,
  Trash2,
  Home,
  Calendar,
  FileText,
  Clock,
  HardHat,
} from "lucide-react";

export default function ScheduledTaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { scheduledTask, isLoading, isError, mutate } =
    useScheduledTaskDetails(id);

  // --- ESTADOS PARA CONTROLAR LOS MODALES ---
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  // --- MANEJADORES DE EVENTOS ---
  const handleToggle = async () => {
    /* ... (sin cambios) */
  };

  const handleRunNow = async () => {
    const toastId = toast.loading("Forzando ejecución de la regla...");
    try {
      const res = await api.post(`/scheduled-tasks/${id}/run-now`);
      toast.success("Ejecución forzada completada.", {
        id: toastId,
        description: res.data.message,
      });
      mutate(); // <-- IMPORTANTE: Refresca los datos para actualizar 'Última Ejecución'
    } catch (error) {
      toast.error("Acción fallida", {
        id: toastId,
        description: getErrorMessage(error),
      });
    }
  };

  const handleEdit = useCallback(() => setIsFormModalOpen(true), []);
  const handleDeleteAttempt = useCallback(() => setIsDeleteAlertOpen(true), []);

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/scheduled-tasks/${id}`);
      toast.success("Regla eliminada.");
      router.push("/admin/scheduled-tasks"); // Navegamos fuera de la página eliminada
    } catch (error) {
      toast.error("Error al eliminar", { description: getErrorMessage(error) });
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
    <>
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
              <Button variant="secondary" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </Button>
              <Button variant="destructive" onClick={handleDeleteAttempt}>
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
                ? new Date(scheduledTask.lastRunAt).toLocaleString("es-DO", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })
                : "Nunca"}
            </TaskDetailItem>
          </CardContent>
        </Card>
      </div>

      {/* --- MODALES PARA EDITAR Y ELIMINAR --- */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Regla de Tarea Programada</DialogTitle>
          </DialogHeader>
          <div className="max-h-[75vh] overflow-y-auto p-1 pr-6">
            <ScheduledTaskForm
              scheduledTaskToEdit={scheduledTask}
              onSuccess={() => {
                setIsFormModalOpen(false);
                mutate(); // Refresca los datos al guardar
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la regla de automatización{" "}
              <span className="font-bold">
                &quot;{scheduledTask.name}&quot;
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
