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
import { useMediaQuery } from "@/hooks/use-media-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { ActionsMenu } from "./ActionsMenu";

// La interfaz de props que define qué datos y funciones acepta el componente
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
    // Esqueleto de carga para la vista móvil (lista de tarjetas)
    if (!isDesktop) {
      return (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      );
    }
    // Esqueleto de carga para la vista de escritorio (tabla)
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    <Skeleton className="h-5 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
                {/* La primera columna se usa como título de la tarjeta */}
                {flexRender(
                  row.getVisibleCells()[0].column.columnDef.cell,
                  row.getVisibleCells()[0].getContext()
                )}
              </CardTitle>
              {/* Se muestra el menú de acciones si se proveen las funciones */}
              {onEdit && onDelete && (
                <ActionsMenu
                  onEdit={() => onEdit(row.original)}
                  onDelete={() => onDelete(row.original)}
                />
              )}
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm text-muted-foreground space-y-2">
              {/* Se muestran el resto de las columnas como "Etiqueta: Valor" */}
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
                    <div className="text-right">
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
        {table.getRowModel().rows.length === 0 && (
          <p className="text-center py-8">No se encontraron resultados.</p>
        )}
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
