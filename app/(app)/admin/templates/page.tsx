// app/(app)/admin/templates/page.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { PlusCircle } from "lucide-react";

import { TaskTemplateType } from "@/types";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/handle-error";
import { useTaskTemplates } from "@/hooks/use-task-templates";

import { PageHeader } from "@/components/common/page-header";
import { GenericDataTable } from "@/components/common/GenericDataTable";
import { ActionsMenu } from "@/components/common/ActionsMenu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  //   DialogDescription,
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
import { TemplateForm } from "@/components/task-templates/TemplateForm";
import { Badge } from "@/components/ui/badge";

export default function ManageTemplatesPage() {
  const { templates, isLoading, mutate } = useTaskTemplates();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<
    TaskTemplateType | undefined
  >(undefined);

  const handleAddNew = useCallback(() => {
    setSelectedItem(undefined);
    setIsFormModalOpen(true);
  }, []);

  const handleEdit = useCallback((item: TaskTemplateType) => {
    setSelectedItem(item);
    setIsFormModalOpen(true);
  }, []);

  const handleDeleteAttempt = useCallback((item: TaskTemplateType) => {
    setSelectedItem(item);
    setIsDeleteAlertOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedItem) return;
    try {
      await api.delete(`/task-templates/${selectedItem._id}`);
      toast.success("Plantilla eliminada.");
      mutate();
    } catch (error) {
      toast.error("Error al eliminar", { description: getErrorMessage(error) });
    }
  }, [selectedItem, mutate]);

  const columns = useMemo<ColumnDef<TaskTemplateType>[]>(
    () => [
      { accessorKey: "name", header: "Nombre de Plantilla" },
      { accessorKey: "title", header: "Título de Tarea" },
      {
        accessorKey: "taskType",
        header: "Tipo",
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">
            {row.original.taskType.replace(/_/g, " ")}
          </Badge>
        ),
      },
      {
        accessorKey: "criticality",
        header: "Criticidad",
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">
            {row.original.criticality}
          </Badge>
        ),
      },
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
    [handleEdit, handleDeleteAttempt] // <-- Añadimos las dependencias
  );

  const modalTitle = selectedItem
    ? "Editar Plantilla"
    : "Crear Nueva Plantilla";

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Gestión de Plantillas de Tareas"
          description="Crea y edita plantillas para agilizar la creación de tareas recurrentes."
          actionButton={
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Plantilla
            </Button>
          }
        />
        <GenericDataTable
          columns={columns}
          data={templates || []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteAttempt}
        />
      </div>

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>

          {/* Envolvemos el formulario en un div con scroll */}
          <div className="max-h-[70vh] overflow-y-auto p-1 pr-6">
            <TemplateForm
              templateToEdit={selectedItem}
              onSuccess={() => {
                setIsFormModalOpen(false);
                mutate();
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
              Esta acción eliminará permanentemente la plantilla{" "}
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
