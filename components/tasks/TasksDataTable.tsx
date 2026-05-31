// src/components/tasks/TasksDataTable.tsx
"use client";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTasks } from "@/hooks/use-tasks";
import { TaskType, TaskStatus } from "@/types";
import { Badge } from "../ui/badge";
import { format, isPast, isToday } from "date-fns";
import { TaskActions } from "./TaskActions";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TasksDataTableProps {
  filters: { search?: string; status?: TaskStatus; criticality?: string; taskType?: string };
  onEdit: (task: TaskType) => void;
  onDelete: (task: TaskType) => void;
}

export function TasksDataTable({ filters }: TasksDataTableProps) {
  const { tasks, isLoading, isError } = useTasks(filters);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const columns: ColumnDef<TaskType>[] = [
    {
      accessorKey: "title",
      header: "Título",
      cell: ({ row }) => {
        const task = row.original;
        return (
          <Link
            href={`/tasks/${task._id}`}
            className={cn(
              "font-medium text-primary hover:underline",
              task.isArchived && "text-muted-foreground line-through italic"
            )}
          >
            {task.title}
          </Link>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant: "outline" | "secondary" | "default" =
          status === "completada"
            ? "default"
            : status === "en progreso"
            ? "secondary"
            : "outline";
        return (
          <Badge variant={variant} className="capitalize">
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "criticality",
      header: "Criticidad",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("criticality")}</div>
      ),
    },
    {
      accessorKey: "location.name",
      header: "Ubicación",
    },
    {
      id: "asignado",
      header: "Asignado a",
      cell: ({ row }) => {
        const task = row.original;
        return (
          task.assignedTo?.name ||
          task.contractorAssociated?.companyName ||
          "N/A"
        );
      },
    },
    {
      accessorKey: "dueDate",
      header: "Vencimiento",
      cell: ({ row }) => {
        const date = new Date(row.getValue("dueDate"));
        const status = row.original.status;
        const active = status !== "completada" && status !== "cancelada";
        const overdue = active && isPast(date) && !isToday(date);
        const dueToday = active && isToday(date);
        return (
          <span className={cn(
            "font-medium",
            overdue && "text-destructive",
            dueToday && "text-orange-500",
          )}>
            {overdue && "⚠ "}
            {format(date, "dd/MM/yyyy")}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <TaskActions task={row.original} />,
    },
  ];

  const table = useReactTable({
    data: tasks || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-8 text-destructive">
        Error al cargar las tareas.
      </div>
    );
  }

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const firstRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  // VISTA MÓVIL
  if (!isDesktop) {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          {table.getRowModel().rows.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              No se encontraron tareas con los filtros actuales.
            </p>
          ) : (
            table.getRowModel().rows.map((row) => (
              <Card key={row.id}>
                <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                  <CardTitle className="text-base font-semibold leading-tight">
                    {flexRender(
                      row.getVisibleCells()[0].column.columnDef.cell,
                      row.getVisibleCells()[0].getContext()
                    )}
                  </CardTitle>
                  {flexRender(
                    row.getVisibleCells().slice(-1)[0].column.columnDef.cell,
                    row.getVisibleCells().slice(-1)[0].getContext()
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
            ))
          )}
        </div>
        <PaginationControls
          table={table}
          firstRow={firstRow}
          lastRow={lastRow}
          totalRows={totalRows}
          pageIndex={pageIndex}
          pageSize={pageSize}
        />
      </div>
    );
  }

  // VISTA ESCRITORIO
  return (
    <div className="space-y-4">
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
                  No se encontraron tareas con los filtros actuales.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <PaginationControls
        table={table}
        firstRow={firstRow}
        lastRow={lastRow}
        totalRows={totalRows}
        pageIndex={pageIndex}
        pageSize={pageSize}
      />
    </div>
  );
}

// Componente reutilizable de controles de paginación
function PaginationControls({
  table,
  firstRow,
  lastRow,
  totalRows,
  pageIndex,
  pageSize,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any;
  firstRow: number;
  lastRow: number;
  totalRows: number;
  pageIndex: number;
  pageSize: number;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1">
      <p className="text-sm text-muted-foreground">
        {totalRows === 0
          ? "Sin resultados"
          : `Mostrando ${firstRow}–${lastRow} de ${totalRows} tareas`}
      </p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Filas por página
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => table.setPageSize(Number(val))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2 whitespace-nowrap">
            {pageIndex + 1} / {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
