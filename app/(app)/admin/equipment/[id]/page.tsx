"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

import {
  Building,
  Calendar,
  HardHat,
  MapPin,
  Wrench,
  // Edit,
  ShieldAlert,
  // Edit,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GenericDataTable } from "@/components/common/GenericDataTable";
import { TaskDetailItem } from "@/components/tasks/TaskDetailItem";
// import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { useEquipmentDetails } from "@/hooks/use-equipment-details";
import { useTasksByEquipment } from "@/hooks/use-tasks-by-equipment";
import { TaskType, TaskTypeEnum } from "@/types";
// import { Button } from "@/components/ui/button";

export default function EquipmentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const {
    equipment,
    isLoading: isLoadingInfo,
    isError: isErrorInfo,
  } = useEquipmentDetails(id);
  const { tasks, isLoading: isLoadingTasks } = useTasksByEquipment(id);

  // Definición de columnas personalizada para máxima trazabilidad
  // En app/(app)/equipment/[id]/page.tsx

  const taskColumns = useMemo<ColumnDef<TaskType>[]>(
    () => [
      {
        accessorKey: "completedAt",
        header: "Fecha",
        cell: ({ row }) => {
          const date = row.original.completedAt || row.original.createdAt;
          return (
            <div className="min-w-[100px]">
              {format(new Date(date), "dd MMM, yyyy", { locale: es })}
            </div>
          );
        },
      },
      {
        accessorKey: "title",
        header: "Tarea y Detalles de Falla", // <-- Título de columna más descriptivo
        cell: ({ row }) => {
          const task = row.original;
          return (
            <div className="flex flex-col gap-1">
              {/* El Título de la Tarea */}
              <Link
                href={`/tasks/${task._id}`}
                className={cn(
                  "font-semibold text-primary hover:underline",
                  task.isArchived && "text-muted-foreground"
                )}
              >
                {task.title}
              </Link>

              {/* El Reporte de Falla (solo para M. Correctivos) */}
              {task.taskType === TaskTypeEnum.CORRECTIVO &&
                task.failureReport && (
                  <div className="pl-4 border-l-2 ml-2 mt-1 space-y-1 text-xs text-muted-foreground">
                    <p>
                      <span className="font-semibold text-foreground/80">
                        Diagnóstico:
                      </span>{" "}
                      {task.failureReport.diagnosis}
                    </p>
                    <p>
                      <span className="font-semibold text-foreground/80">
                        Solución:
                      </span>{" "}
                      {task.failureReport.correctiveAction}
                    </p>
                  </div>
                )}

              {task.isArchived && (
                <Badge variant="outline" className="w-fit mt-1">
                  Archivada
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "failureReport.failureMode",
        header: "Modo de Falla",
        cell: ({ row }) => {
          if (row.original.taskType !== TaskTypeEnum.CORRECTIVO)
            return <span className="text-muted-foreground">—</span>;
          const mode = row.original.failureReport?.failureMode;
          return mode ? (
            <Badge
              variant="destructive"
              className="capitalize whitespace-nowrap"
            >
              <ShieldAlert className="h-3 w-3 mr-1" />
              {mode.replace(/_/g, " ")}
            </Badge>
          ) : (
            <span className="text-muted-foreground">No rep.</span>
          );
        },
      },
      {
        accessorKey: "assignedTo",
        header: "Realizado por",
        cell: ({ row }) => (
          <div className="min-w-[120px]">
            {row.original.assignedTo?.name ||
              row.original.contractorAssociated?.companyName ||
              "N/A"}
          </div>
        ),
      },
    ],
    []
  );

  if (isLoadingInfo) return <EquipmentDetailSkeleton />;
  if (isErrorInfo)
    return (
      <div className="p-6 text-destructive text-center">
        Error al cargar la información del equipo.
      </div>
    );
  if (!equipment)
    return <div className="p-6 text-center">Equipo no encontrado.</div>;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={equipment.name}
        description={`Expediente completo para el equipo con código: ${equipment.code}`}
      />

      {/* --- INICIO DEL NUEVO LAYOUT DE DOS FILAS --- */}

      {/* Fila 1: Tarjeta de Información del Activo */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Activo</CardTitle>
        </CardHeader>
        {/* Rejilla interna adaptable para los detalles */}
        <CardContent className="grid gap-x-8 gap-y-4 sm:grid-cols-2 md:grid-cols-3 text-sm">
          <TaskDetailItem icon={HardHat} label="Código">
            {equipment.code}
          </TaskDetailItem>
          <TaskDetailItem icon={Wrench} label="Tipo">
            <span className="capitalize">
              {equipment.type.replace(/_/g, " ")}
            </span>
          </TaskDetailItem>
          <TaskDetailItem icon={Building} label="Marca">
            {equipment.brand || "N/A"}
          </TaskDetailItem>
          <TaskDetailItem icon={MapPin} label="Ubicación Principal">
            {equipment.location.name}
          </TaskDetailItem>
          {equipment.installationDate && (
            <TaskDetailItem icon={Calendar} label="Instalado el">
              {format(
                new Date(equipment.installationDate),
                "dd 'de' MMMM, yyyy",
                { locale: es }
              )}
            </TaskDetailItem>
          )}
        </CardContent>
      </Card>

      {/* Fila 2: Tarjeta del Historial de Tareas */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Fallos y Mantenimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <GenericDataTable
            columns={taskColumns}
            data={tasks || []}
            isLoading={isLoadingTasks}
          />
        </CardContent>
      </Card>

      {/* --- FIN DEL NUEVO LAYOUT --- */}
    </div>
  );
}

function EquipmentDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Cargando Equipo..."
        description={<Skeleton className="h-4 w-64 mt-1" />}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 space-y-6">
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
}
