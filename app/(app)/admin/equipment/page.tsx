// app/(app)/admin/equipment/page.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { PlusCircle, Shapes } from "lucide-react";

import { EquipmentType, EquipmentTypeEnum } from "@/types";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/handle-error";
// import { useEquipment } from "@/hooks/use-equipment";

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
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePaginatedEquipment } from "@/hooks/use-paginated-equipment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ManageEquipmentPage() {
  // const { equipment, isLoading, mutate } = useEquipment();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [typeFilter, setTypeFilter] = useState("");

  const { equipment, total, isLoading, mutate } = usePaginatedEquipment({
    page,
    limit,
    search: debouncedSearchTerm,
    type: typeFilter,
  });

  const pageCount = Math.ceil(total / limit);

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

        {/* --- BARRA DE BÚSQUEDA --- */}
        <div className="flex items-center">
          <Input
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm mr-1"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_TYPES">Todos los tipos</SelectItem>
              {Object.values(EquipmentTypeEnum).map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <GenericDataTable
          columns={columns}
          data={equipment || []}
          isLoading={isLoading}
          onEdit={handleEdit} // <-- AÑADIR ESTA PROP
          onDelete={handleDeleteAttempt} // <-- Y ESTA
        />
      </div>

      {/* --- CONTROLES DE PAGINACIÓN --- */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage((p) => Math.max(1, p - 1));
              }}
            />
          </PaginationItem>
          {[...Array(pageCount)].map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage(i + 1);
                }}
                isActive={page === i + 1}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage((p) => Math.min(pageCount, p + 1));
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

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
