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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionsMenu } from "./ActionsMenu";
import { Skeleton } from "../ui/skeleton";

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
  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Si está cargando, mostramos un esqueleto simple
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* VISTA MÓVIL: Se muestra por defecto y se oculta en pantallas medianas (md) y superiores */}
      <div className="space-y-3 md:hidden">
        {table.getRowModel().rows.map((row) => (
          <Card key={row.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-base font-semibold leading-tight break-all">
                {flexRender(
                  row.getVisibleCells()[0].column.columnDef.cell,
                  row.getVisibleCells()[0].getContext()
                )}
              </CardTitle>
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
                    className="flex justify-between border-t pt-2 first:border-none first:pt-0 gap-2"
                  >
                    <span className="font-medium text-foreground/80">
                      {String(cell.column.columnDef.header)}:
                    </span>
                    <div className="text-right break-all">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* VISTA DE ESCRITORIO: Se oculta por defecto y se muestra en pantallas medianas (md) y superiores */}
      <div className="hidden rounded-md border bg-card md:block">
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
