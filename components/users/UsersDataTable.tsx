// src/components/users/UsersDataTable.tsx
"use client";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserType } from "@/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { UserActions } from "./UserActions";
import { Skeleton } from "../ui/skeleton";

interface UsersDataTableProps {
  columns: ColumnDef<UserType>[];
  data: UserType[];
  isLoading: boolean;
  onEdit: (user: UserType) => void;
  onDelete: (user: UserType) => void;
}

export function UsersDataTable({
  columns,
  data,
  isLoading,
  onEdit,
  onDelete,
}: UsersDataTableProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading)
    return <div className="text-center p-8">Cargando usuarios...</div>;
  if (!isDesktop) {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {table.getRowModel().rows.map((row) => (
          <Card key={row.id} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-base font-semibold leading-tight">
                {/* Muestra el nombre como título de la tarjeta */}
                {String(row.original.name)}
              </CardTitle>
              {/* Renderiza el menú de acciones */}
              <UserActions
                onEdit={() => onEdit(row.original)}
                onDelete={() => onDelete(row.original)}
              />
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm text-muted-foreground space-y-2">
              {/* Muestra el resto de los campos importantes */}
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-medium text-foreground/80">Email:</span>
                <span className="text-right">{row.original.email}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium text-foreground/80">
                  Departamento:
                </span>
                <span className="text-right">{row.original.department}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium text-foreground/80">Rol:</span>
                <div className="text-right">
                  <Badge variant="outline" className="capitalize">
                    {row.original.role}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No se encontraron usuarios.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
