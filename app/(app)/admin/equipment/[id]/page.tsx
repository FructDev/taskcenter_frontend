// app/(app)/equipment/[id]/page.tsx
"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Building, Calendar, HardHat, MapPin, Wrench } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GenericDataTable } from "@/components/common/GenericDataTable";
import { columns as baseTaskColumns } from "@/components/tasks/columns";
import { TaskDetailItem } from "@/components/tasks/TaskDetailItem";

import { useEquipmentDetails } from "@/hooks/use-equipment-details";
import { useTasksByEquipment } from "@/hooks/use-tasks-by-equipment";
import { Skeleton } from "@/components/ui/skeleton";

export default function EquipmentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  // Obtenemos los datos del equipo y sus tareas asociadas
  const {
    equipment,
    isLoading: isLoadingInfo,
    isError: isErrorInfo,
  } = useEquipmentDetails(id);
  const { tasks, isLoading: isLoadingTasks } = useTasksByEquipment(id);

  // Usamos las columnas base de tareas, ya que es una vista de solo lectura
  const taskColumns = useMemo(() => baseTaskColumns, []);

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
    <div className="flex flex-col gap-8">
      <PageHeader
        title={equipment.name}
        description={`Expediente completo para el equipo con código: ${equipment.code}`}
      />

      {/* Tarjeta con los detalles del activo */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Activo</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
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
          <TaskDetailItem icon={MapPin} label="Ubicación">
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

      {/* Tarjeta con la tabla del historial de tareas */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Tareas y Mantenimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <GenericDataTable
            columns={taskColumns}
            data={tasks || []}
            isLoading={isLoadingTasks}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para mostrar un esqueleto de carga profesional
function EquipmentDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Cargando Equipo..."
        description={<Skeleton className="h-4 w-64 mt-1" />}
      />
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-64" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
