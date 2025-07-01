// app/(app)/tasks/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useTask } from "@/hooks/use-task";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/handle-error";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Calendar,
  //   CalendarDays,
  CheckCircle,
  Clock,
  Edit,
  HardHat,
  Home,
  MapPin,
  Pause,
  PlayCircle,
  User,
  XCircle,
} from "lucide-react";
import { AssignTaskModal } from "@/components/tasks/AssignTaskModal";
import { TaskComments } from "@/components/tasks/TaskComments";
import { TaskAttachments } from "@/components/tasks/TaskAttachments";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TaskForm } from "@/components/tasks/TaskForm";
import { StatusChangeDialog } from "@/components/tasks/StatusChangeDialog";

export default function TaskDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { task, isLoading, isError: error, mutate } = useTask(id);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"pause" | "cancel" | null>(
    null
  );

  const handleAction = async (action: "start" | "complete") => {
    try {
      // La URL de la API se construye correctamente con el ID de la tarea
      await api.post(`/tasks/${id}/${action}`);
      toast.success(
        `Tarea marcada como "${
          action === "start" ? "en progreso" : "completada"
        }"`
      );
      mutate(); // Refrescamos los datos de la tarea actual para ver el cambio
    } catch (error) {
      toast.error("Acción fallida", { description: getErrorMessage(error) });
    }
  };

  if (isLoading) return <TaskDetailSkeleton />;
  if (error)
    return <div className="p-6 text-destructive">Error: {error.message}</div>;
  if (!task) return null;

  const isOverdue =
    new Date(task.dueDate) < new Date() && task.status !== "completada";
  const assignedToName =
    task.assignedTo?.name ||
    task.contractorAssociated?.companyName ||
    "No asignada";

  const handleResume = async () => {
    try {
      await api.post(`/tasks/${id}/resume`);
      toast.success("Tarea reanudada y puesta 'en progreso'.");
      mutate();
    } catch (error) {
      toast.error("Acción fallida", { description: getErrorMessage(error) });
    }
  };

  const handleStatusChangeWithReason = async (reason: string) => {
    if (!dialogAction) return; // No hacer nada si no hay una acción definida

    try {
      await api.post(`/tasks/${id}/${dialogAction}`, { reason });
      toast.success(
        `Tarea marcada como ${
          dialogAction === "cancel" ? "cancelada" : "pausada"
        }.`
      );
      mutate();
    } catch (error) {
      toast.error("Acción fallida", { description: getErrorMessage(error) });
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      {/* SECCIÓN DE CABECERA */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight break-words">
            {task.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            ID de Tarea: T-{task._id.slice(-6).toUpperCase()}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {task.status === "pendiente" && (
            <Button onClick={() => handleAction("start")}>
              <PlayCircle className="mr-2 h-4 w-4" /> Iniciar
            </Button>
          )}
          {task.status === "en progreso" && (
            <Button onClick={() => handleAction("complete")}>
              <CheckCircle className="mr-2 h-4 w-4" /> Completar
            </Button>
          )}
          {/* Botón para Pausar */}
          {task.status === "en progreso" && (
            <Button
              variant="secondary"
              onClick={() => setDialogAction("pause")}
            >
              <Pause className="mr-2 h-4 w-4" /> Pausar
            </Button>
          )}
          {/* Botón para Reanudar */}
          {task.status === "pausada" && (
            <Button onClick={handleResume}>
              <PlayCircle className="mr-2 h-4 w-4" /> Reanudar Tarea
            </Button>
          )}
          <Button variant="outline">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" /> Editar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Editar Tarea</DialogTitle>
                  <DialogDescription>
                    Modifica los detalles de la tarea a continuación.
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto p-1 pr-6">
                  <TaskForm
                    taskToEdit={task}
                    onSuccess={() => setIsEditDialogOpen(false)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </Button>
          {/* Botón para Cancelar */}
          {(task.status === "pendiente" ||
            task.status === "en progreso" ||
            task.status === "pausada") && (
            <Button
              variant="destructive"
              onClick={() => setDialogAction("cancel")}
            >
              <XCircle className="mr-2 h-4 w-4" /> Cancelar
            </Button>
          )}
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL EN REJILLA */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        {/* COLUMNA DE CONTENIDO PRINCIPAL - Le decimos que ocupe 2 de 3 columnas en pantallas grandes */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descripción Detallada</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p className="break-words">
                {task.description || "No se proporcionó una descripción."}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Archivos Adjuntos</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskAttachments task={task} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Bitácora y Comentarios</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskComments task={task} />
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA DE METADATOS - Ocupa 1 de 3 columnas en pantallas grandes */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow icon={Home} label="Estado">
                <Badge className="capitalize">{task.status}</Badge>
              </InfoRow>
              <InfoRow icon={AlertTriangle} label="Criticidad">
                <Badge
                  variant={
                    task.criticality === "alta" ? "destructive" : "outline"
                  }
                  className="capitalize"
                >
                  {task.criticality}
                </Badge>
              </InfoRow>
              <InfoRow icon={User} label="Asignado a">
                {assignedToName}
              </InfoRow>
              {task.status !== "completada" && task.status !== "cancelada" && (
                <div className="pt-2">
                  <AssignTaskModal task={task} />
                </div>
              )}
              <Separator />
              <InfoRow icon={MapPin} label="Ubicación">
                {task.location.name}
              </InfoRow>
              <InfoRow icon={HardHat} label="Código">
                {task.location.code}
              </InfoRow>
              <Separator />
              <InfoRow icon={Calendar} label="Vence">
                {format(new Date(task.dueDate), "PPPP", { locale: es })}
              </InfoRow>
              {isOverdue && (
                <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  ¡TAREA VENCIDA!
                </p>
              )}
              <InfoRow icon={Clock} label="Creada">
                {format(new Date(task.createdAt), "dd MMM yy, HH:mm", {
                  locale: es,
                })}
              </InfoRow>
              {task.completedAt && (
                <InfoRow icon={CheckCircle} label="Completada">
                  {format(new Date(task.completedAt), "dd MMM yy, HH:mm", {
                    locale: es,
                  })}
                </InfoRow>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <StatusChangeDialog
        isOpen={!!dialogAction}
        onOpenChange={(open) => !open && setDialogAction(null)}
        onSubmit={handleStatusChangeWithReason}
        title={`${dialogAction === "cancel" ? "Cancelar" : "Pausar"} Tarea`}
        description={`Para continuar, por favor proporciona una justificación clara para ${
          dialogAction === "cancel" ? "cancelar" : "pausar"
        } esta tarea.`}
      />
    </div>
  );
}

// Componente de ayuda para mostrar filas de información de forma consistente
function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-start gap-4">
      <div className="flex items-center text-sm text-muted-foreground">
        <Icon className="h-4 w-4 mr-2 shrink-0" />
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium text-right break-words">
        {children}
      </div>
    </div>
  );
}

// Esqueleto de carga (ya lo tenías, se puede mover a su propio archivo si quieres)
function TaskDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Skeleton para la Cabecera */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-5 w-24 mb-2 rounded-md" />
          <Skeleton className="h-9 w-72 md:w-96 rounded-lg" />
          <Skeleton className="h-4 w-48 mt-2 rounded-md" />
        </div>
        <div className="flex gap-2 shrink-0">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </header>

      <Separator />

      {/* Skeleton para la Rejilla Principal */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Skeleton para la Columna Izquierda */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3 rounded-md" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Skeleton para la Columna Derecha */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-8 w-1/2 ml-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
