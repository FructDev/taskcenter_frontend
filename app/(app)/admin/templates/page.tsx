// app/(app)/admin/templates/page.tsx
"use client";

import { useState, useMemo } from "react";
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

  const handleAddNew = () => {
    setSelectedItem(undefined);
    setIsFormModalOpen(true);
  };

  const handleEdit = (item: TaskTemplateType) => {
    setSelectedItem(item);
    setIsFormModalOpen(true);
  };

  const handleDeleteAttempt = (item: TaskTemplateType) => {
    setSelectedItem(item);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    try {
      await api.delete(`/task-templates/${selectedItem._id}`);
      toast.success("Plantilla eliminada.");
      mutate(); // Refresca la lista de plantillas
    } catch (error) {
      toast.error("Error al eliminar", { description: getErrorMessage(error) });
    }
  };

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
    []
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
        />
      </div>

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <TemplateForm
            templateToEdit={selectedItem}
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
