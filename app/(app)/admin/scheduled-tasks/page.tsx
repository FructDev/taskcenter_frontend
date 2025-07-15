// app/(app)/admin/scheduled-tasks/page.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { PlusCircle } from "lucide-react";
import { ScheduledTaskType } from "@/types";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/handle-error";
import { useScheduledTasks } from "@/hooks/use-scheduled-tasks";
import { PageHeader } from "@/components/common/page-header";
import { GenericDataTable } from "@/components/common/GenericDataTable";
import { ActionsMenu } from "@/components/common/ActionsMenu";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function ManageScheduledTasksPage() {
  const { scheduledTasks, isLoading, mutate } = useScheduledTasks();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<
    ScheduledTaskType | undefined
  >(undefined);

  const handleAddNew = useCallback(() => {
    setSelectedItem(undefined);
    setIsFormModalOpen(true);
  }, []);

  const handleEdit = useCallback((item: ScheduledTaskType) => {
    setSelectedItem(item);
    setIsFormModalOpen(true);
  }, []);

  const handleDeleteAttempt = useCallback((item: ScheduledTaskType) => {
    setSelectedItem(item);
    setIsDeleteAlertOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedItem) return;
    try {
      await api.delete(`/scheduled-tasks/${selectedItem._id}`);
      toast.success("Regla eliminada correctamente.");
      mutate();
    } catch (error) {
      toast.error("Error al eliminar la regla", {
        description: getErrorMessage(error),
      });
    }
  }, [selectedItem, mutate]);

  const columns = useMemo<ColumnDef<ScheduledTaskType>[]>(
    () => [
      {
        accessorKey: "isEnabled",
        header: "Estado",
        cell: ({ row }) =>
          row.original.isEnabled ? (
            <Badge>Habilitada</Badge>
          ) : (
            <Badge variant="secondary">Deshabilitada</Badge>
          ),
      },
      {
        accessorKey: "name",
        header: "Nombre de la Regla",
        cell: ({ row }) => (
          <Link
            href={`/admin/scheduled-tasks/${row.original._id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: "taskTemplate.name", header: "Usa Plantilla" },
      {
        accessorKey: "targetEquipmentType",
        header: "Aplica a",
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">
            {row.original.targetEquipmentType.replace(/_/g, " ")}
          </Badge>
        ),
      },
      { accessorKey: "schedule", header: "Frecuencia (Cron)" },
      {
        id: "actions",
        cell: ({ row }) => (
          <ActionsMenu
            onEdit={() => handleEdit(row.original)}
            onDelete={() => handleDeleteAttempt(row.original)}
          />
        ),
      },
    ],
    [handleEdit, handleDeleteAttempt]
  );

  const modalTitle = selectedItem
    ? "Editar Regla de Tarea Programada"
    : "Crear Nueva Regla";

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Tareas Programadas"
          description="Automatiza la creación de tareas de mantenimiento recurrentes."
          actionButton={
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Regla
            </Button>
          }
        />
        <GenericDataTable
          columns={columns}
          data={scheduledTasks || []}
          isLoading={isLoading}
          onEdit={handleEdit} // <-- Asegúrate de que esta línea esté
          onDelete={handleDeleteAttempt} // <-- Y esta
        />
      </div>

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <ScheduledTaskForm
            scheduledTaskToEdit={selectedItem}
            onSuccess={() => {
              setIsFormModalOpen(false);
              mutate();
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la regla de automatización{" "}
              <span className="font-bold">
                &quot;{selectedItem?.name}&quot;
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
