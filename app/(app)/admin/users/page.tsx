// app/(app)/admin/users/page.tsx
"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { PlusCircle } from "lucide-react";

import { UserType } from "@/types";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/handle-error";
import { useUsers } from "@/hooks/use-users";

import { PageHeader } from "@/components/common/page-header";
import { UsersDataTable } from "@/components/users/UsersDataTable";
import { UserActions } from "@/components/users/UserActions";
import { UserForm } from "@/components/users/UserForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";

export default function ManageUsersPage() {
  const { users, isLoading, mutate: mutateUsers } = useUsers();

  // Estados para controlar los modales y el usuario seleccionado
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | undefined>(
    undefined
  );

  // --- MANEJADORES DE EVENTOS ---

  const handleAddNew = () => {
    setSelectedUser(undefined); // Limpiamos cualquier usuario seleccionado para asegurar modo "creación"
    setIsFormModalOpen(true);
  };

  const handleEdit = (user: UserType) => {
    setSelectedUser(user);
    setIsFormModalOpen(true);
  };

  const handleDeleteAttempt = (user: UserType) => {
    setSelectedUser(user);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/users/${selectedUser._id}`);
      toast.success("Usuario eliminado correctamente.");
      mutateUsers(); // Refresca la lista de usuarios
    } catch (error) {
      toast.error("Error al eliminar el usuario", {
        description: getErrorMessage(error),
      });
    }
  };

  // --- DEFINICIÓN DE COLUMNAS ---
  // Se define aquí para tener acceso a los manejadores de eventos
  const columns = useMemo<ColumnDef<UserType>[]>(
    () => [
      { accessorKey: "name", header: "Nombre" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "department", header: "Departamento" },
      {
        accessorKey: "role",
        header: "Rol",
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">
            {row.getValue("role")}
          </Badge>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <UserActions
              onEdit={() => handleEdit(user)}
              onDelete={() => handleDeleteAttempt(user)}
            />
          );
        },
      },
    ],
    []
  );

  const modalTitle = selectedUser ? "Editar Usuario" : "Añadir Nuevo Usuario";

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Gestión de Usuarios"
          description="Crea, edita y gestiona los usuarios y sus roles en el sistema."
          actionButton={
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Usuario
            </Button>
          }
        />
        <UsersDataTable
          columns={columns}
          data={users || []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteAttempt}
        />
      </div>

      {/* MODAL PARA CREAR/EDITAR USUARIO */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogDescription>
              Completa los campos para registrar un nuevo usuario en el sistema.
            </DialogDescription>
          </DialogHeader>
          <UserForm
            userToEdit={selectedUser}
            onSuccess={() => {
              setIsFormModalOpen(false);
              mutateUsers();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO DE CONFIRMACIÓN PARA ELIMINAR */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminará permanentemente al
              usuario <span className="font-bold">{selectedUser?.name}</span> y
              todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sí, Eliminar Usuario
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
