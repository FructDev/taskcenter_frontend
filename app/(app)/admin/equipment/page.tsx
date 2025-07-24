// app/(app)/admin/equipment/page.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { PlusCircle, Shapes } from "lucide-react";

import { EquipmentType } from "@/types";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/handle-error";
import { useEquipment } from "@/hooks/use-equipment";

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
import { EquipmentForm } from "@/components/equipment/EquipmentForm";
import Link from "next/link";

export default function ManageEquipmentPage() {
  const { equipment, isLoading, mutate } = useEquipment();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EquipmentType | undefined>(
    undefined
  );

  const handleAddNew = useCallback(() => {
    setSelectedItem(undefined);
    setIsFormModalOpen(true);
  }, []);

  const handleEdit = useCallback((item: EquipmentType) => {
    setSelectedItem(item);
    setIsFormModalOpen(true);
  }, []);

  const handleDeleteAttempt = useCallback((item: EquipmentType) => {
    setSelectedItem(item);
    setIsDeleteAlertOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedItem) return;
    try {
      await api.delete(`/equipment/${selectedItem._id}`);
      toast.success("Equipo eliminado.");
      mutate();
    } catch (error) {
      toast.error("Error al eliminar", { description: getErrorMessage(error) });
    }
  }, [mutate, selectedItem]);

  const columns = useMemo<ColumnDef<EquipmentType>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nombre del Equipo",
        cell: ({ row }) => {
          const equipment = row.original;
          return (
            // Convertimos el nombre en un enlace a la página de detalle
            <Link
              href={`/admin/equipment/${equipment._id}`}
              className="font-medium text-primary hover:underline"
            >
              {equipment.name}
            </Link>
          );
        },
      },
      { accessorKey: "name", header: "Nombre del Equipo" },
      { accessorKey: "code", header: "Código" },
      { accessorKey: "type", header: "Tipo" },
      { accessorKey: "location.name", header: "Ubicación" },
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

  const modalTitle = selectedItem ? "Editar Equipo" : "Añadir Nuevo Equipo";

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Gestión de Activos y Equipos"
          description="Crea y gestiona el inventario de equipos físicos del parque."
          actionButton={
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/admin/equipment/bulk">
                  <Shapes className="mr-2 h-4 w-4" />
                  Creación en Lote
                </Link>
              </Button>
              <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Equipo
              </Button>
            </div>
          }
        />
        <GenericDataTable
          columns={columns}
          data={equipment || []}
          isLoading={isLoading}
          onEdit={handleEdit} // <-- AÑADIR ESTA PROP
          onDelete={handleDeleteAttempt} // <-- Y ESTA
        />
      </div>

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <EquipmentForm
            equipmentToEdit={selectedItem}
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
              Esta acción no se puede deshacer. Eliminará permanentemente el
              equipo
              <span className="font-bold"> {selectedItem?.name}</span> y podría
              afectar a las tareas que lo tengan asociado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sí, Eliminar Equipo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
