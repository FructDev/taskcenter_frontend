// app/(app)/admin/ppe-items/page.tsx
"use client";
import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { PlusCircle } from "lucide-react";
import { PpeItemType } from "@/types";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/handle-error";
import { usePpeItems } from "@/hooks/use-ppe-items";
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
import { PpeItemForm } from "@/components/ppe-items/PpeItemForm";

export default function ManagePpeItemsPage() {
  const { ppeItems, isLoading, mutate } = usePpeItems();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PpeItemType | undefined>(
    undefined
  );

  const handleAddNew = useCallback(() => {
    setSelectedItem(undefined);
    setIsFormModalOpen(true);
  }, []);
  const handleEdit = useCallback((item: PpeItemType) => {
    setSelectedItem(item);
    setIsFormModalOpen(true);
  }, []);
  const handleDeleteAttempt = useCallback((item: PpeItemType) => {
    setSelectedItem(item);
    setIsDeleteAlertOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedItem) return;
    try {
      await api.delete(`/ppe-items/${selectedItem._id}`);
      toast.success("EPP eliminado.");
      mutate();
    } catch (error) {
      toast.error("Error al eliminar", { description: getErrorMessage(error) });
    }
  }, [mutate, selectedItem]);

  const columns = useMemo<ColumnDef<PpeItemType>[]>(
    () => [
      { accessorKey: "name", header: "Nombre del EPP" },
      { accessorKey: "description", header: "Descripción" },
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

  const modalTitle = selectedItem ? "Editar EPP" : "Crear Nuevo EPP";

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Gestión de EPP"
          description="Crea y gestiona el catálogo de Equipos de Protección Personal."
          actionButton={
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear EPP
            </Button>
          }
        />
        <GenericDataTable
          columns={columns}
          data={ppeItems || []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteAttempt}
        />
      </div>
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <PpeItemForm
            ppeItemToEdit={selectedItem}
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
              Esta acción no se puede deshacer. Eliminará permanentemente el EPP
              <span className="font-bold">
                {" "}
                &quot;{selectedItem?.name}&quot;
              </span>{" "}
              del catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDeleteConfirm();
                setIsDeleteAlertOpen(false); // Cierra el diálogo al confirmar
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sí, Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
