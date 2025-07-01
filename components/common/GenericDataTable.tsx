// src/components/common/GenericDataTable.tsx
"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "../ui/skeleton";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ActionsMenu } from "./ActionsMenu";

// --- INTERFAZ DE PROPS CORREGIDA ---
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
  onEdit?: (item: TData) => void;
  onDelete?: (item: TData) => void;
}

export function GenericDataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  onEdit,
  onDelete,
}: DataTableProps<TData, TValue>) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // --- VISTA MÓVIL: LISTA DE TARJETAS ---
  if (!isDesktop) {
    return (
      <div className="space-y-3">
        {table.getRowModel().rows.map((row) => (
          <Card key={row.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-base font-semibold leading-tight">
                {flexRender(
                  row.getVisibleCells()[0].column.columnDef.cell,
                  row.getVisibleCells()[0].getContext()
                )}
              </CardTitle>
              {/* Solo muestra el menú si las funciones onEdit y onDelete fueron provistas */}
              {onEdit && onDelete && (
                <ActionsMenu
                  onEdit={() => onEdit(row.original)}
                  onDelete={() => onDelete(row.original)}
                />
              )}
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm text-muted-foreground space-y-2">
              {row
                .getVisibleCells()
                .slice(1, -1)
                .map((cell) => (
                  <div
                    key={cell.id}
                    className="flex justify-between border-t pt-2 first:border-none first:pt-0"
                  >
                    <span className="font-medium text-foreground/80">
                      {String(cell.column.columnDef.header)}:
                    </span>
                    <span className="text-right">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </span>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // --- VISTA DE ESCRITORIO: TABLA ---
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
                No se encontraron resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
