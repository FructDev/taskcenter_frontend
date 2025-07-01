// src/components/users/columns.tsx
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { UserType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "./UserActions";

// Convertimos la definición de columnas en una función que acepta los manejadores
export const getColumns = (
  onEdit: (user: UserType) => void,
  onDelete: (user: UserType) => void
): ColumnDef<UserType>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "department",
    header: "Departamento",
  },
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
      // Pasamos las funciones recibidas al componente de acciones
      return (
        <UserActions
          onEdit={() => onEdit(user)}
          onDelete={() => onDelete(user)}
        />
      );
    },
  },
];
