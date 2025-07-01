// app/(app)/admin/contractors/page.tsx
"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { PlusCircle } from "lucide-react";

import { ContractorType } from "@/types";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/handle-error";
import { useContractors } from "@/hooks/use-contractors"; // <-- Usamos el hook de contratistas

import { PageHeader } from "@/components/common/page-header";
import { ContractorForm } from "@/components/contractors/ContractorForm"; // <-- Usamos el nuevo formulario
// Reutilizaremos los componentes genéricos de tabla y acciones que crearemos en un momento
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

export default function ManageContractorsPage() {
  const { contractors, isLoading, mutate } = useContractors();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContractorType | undefined>(
    undefined
  );

  const handleAddNew = () => {
    setSelectedItem(undefined);
    setIsFormModalOpen(true);
  };

  const handleEdit = (item: ContractorType) => {
    setSelectedItem(item);
    setIsFormModalOpen(true);
  };

  const handleDeleteAttempt = (item: ContractorType) => {
    setSelectedItem(item);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    try {
      await api.delete(`/contractors/${selectedItem._id}`);
      toast.success("Contratista eliminado.");
      mutate();
    } catch (error) {
      toast.error("Error al eliminar", { description: getErrorMessage(error) });
    }
  };

  const columns = useMemo<ColumnDef<ContractorType>[]>(
    () => [
      { accessorKey: "companyName", header: "Nombre de Empresa" },
      { accessorKey: "contactInfo", header: "Contacto" },
      { accessorKey: "specialty", header: "Especialidad" },
      { accessorKey: "phone", header: "Teléfono" },
      {
        id: "actions",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <ActionsMenu
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDeleteAttempt(item)}
            />
          );
        },
      },
    ],
    []
  );

  const modalTitle = selectedItem
    ? "Editar Contratista"
    : "Añadir Nuevo Contratista";

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Gestión de Contratistas"
          description="Añade, edita y gestiona las empresas contratistas externas."
          actionButton={
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Contratista
            </Button>
          }
        />
        <GenericDataTable
          columns={columns}
          data={contractors || []}
          isLoading={isLoading}
          onEdit={handleEdit} // <-- AÑADIR ESTA LÍNEA
          onDelete={handleDeleteAttempt} // <-- AÑADIR ESTA LÍNEA
        />
      </div>

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <ContractorForm
            contractorToEdit={selectedItem}
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
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al contratista{" "}
              <span className="font-bold">{selectedItem?.companyName}</span>.
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
