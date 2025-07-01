// src/components/tasks/TasksDataTable.tsx
"use client";
import {
  useReactTable,
  getCoreRowModel,
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
// import { columns } from "./columns";
import { useTasks } from "@/hooks/use-tasks";
import { TaskType } from "@/types";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { TaskActions } from "./TaskActions";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// 1. Definimos las props que nuestro componente aceptará
interface TasksDataTableProps {
  filters: { search?: string };
  onEdit: (task: TaskType) => void;
  onDelete: (task: TaskType) => void;
}

// 2. Hacemos que el componente reciba y desestructure las 'props'
export function TasksDataTable({
  filters,
}: // onEdit,
// onDelete,
TasksDataTableProps) {
  // 3. Pasamos los filtros recibidos directamente a nuestro hook de SWR
  const { tasks, isLoading, isError } = useTasks(filters);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const columns: ColumnDef<TaskType>[] = [
    {
      accessorKey: "title",
      header: "Título",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
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
      cell: ({ row }) =>
        format(new Date(row.getValue("dueDate")), "dd/MM/yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const task = row.original;
        return <TaskActions task={task} />;
      },
    },
  ];

  const table = useReactTable({
    data: tasks || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading)
    return <div className="text-center p-8">Cargando tareas...</div>;
  if (isError)
    return (
      <div className="text-center p-8 text-destructive">
        Error al cargar las tareas.
      </div>
    );

  // --- VISTA MÓVIL: LISTA DE TARJETAS ---
  if (!isDesktop) {
    if (isLoading) {
      /* ... esqueleto de carga ... */
    }
    return (
      <div className="space-y-3">
        {table.getRowModel().rows.map((row) => (
          <Card key={row.id}>
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <CardTitle className="text-base font-semibold leading-tight">
                {flexRender(
                  row.getVisibleCells()[0].column.columnDef.cell,
                  row.getVisibleCells()[0].getContext()
                )}
              </CardTitle>
              {/* Renderizamos solo la columna de acciones (la última) */}
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
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
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
                No se encontraron tareas con los filtros actuales.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
