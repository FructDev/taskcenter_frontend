// app/(app)/admin/locations/page.tsx
"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { PlusCircle } from "lucide-react";

import { LocationType } from "@/types";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/handle-error";
import { useLocations } from "@/hooks/use-locations";

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
import { LocationForm } from "@/components/locations/LocationForm";
import { Badge } from "@/components/ui/badge";

export default function ManageLocationsPage() {
  const { locations, isLoading, mutate } = useLocations();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LocationType | undefined>(
    undefined
  );

  const handleAddNew = () => {
    setSelectedItem(undefined);
    setIsFormModalOpen(true);
  };

  const handleEdit = (item: LocationType) => {
    setSelectedItem(item);
    setIsFormModalOpen(true);
  };

  const handleDeleteAttempt = (item: LocationType) => {
    setSelectedItem(item);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    try {
      await api.delete(`/locations/${selectedItem._id}`);
      toast.success("Ubicación eliminada.");
      mutate();
    } catch (error) {
      toast.error("Error al eliminar", { description: getErrorMessage(error) });
    }
  };

  const columns = useMemo<ColumnDef<LocationType>[]>(
    () => [
      { accessorKey: "name", header: "Nombre" },
      { accessorKey: "code", header: "Código" },
      {
        accessorKey: "type",
        header: "Tipo",
        cell: ({ row }) => (
          <Badge variant="secondary" className="capitalize">
            {row.original.type.replace(/_/g, " ")}
          </Badge>
        ),
      },
      {
        accessorKey: "parentLocation.name",
        header: "Ubicación Padre",
        cell: ({ row }) => row.original.parentLocation?.name || "—",
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
    ? "Editar Ubicación"
    : "Añadir Nueva Ubicación";

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Gestión de Ubicaciones"
          description="Crea y organiza la estructura jerárquica de las ubicaciones en el parque."
          actionButton={
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Ubicación
            </Button>
          }
        />
        <GenericDataTable
          columns={columns}
          data={locations || []}
          isLoading={isLoading}
        />
      </div>

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <LocationForm
            locationToEdit={selectedItem}
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
              Eliminar esta ubicación podría afectar a tareas existentes. Esta
              acción es irreversible.
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
