// src/components/tasks/columns.tsx
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { TaskType } from "@/types";
import { Badge } from "@/components/ui/badge";

import { format } from "date-fns";
import { TaskActions } from "./TaskActions";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<TaskType>[] = [
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
            // Si la tarea está archivada, la tacha y le da un estilo atenuado
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
        task.assignedTo?.name || task.contractorAssociated?.companyName || "N/A"
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: "Vencimiento",
    cell: ({ row }) => format(new Date(row.getValue("dueDate")), "dd/MM/yyyy"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const task = row.original;
      return <TaskActions task={task} />;
    },
  },
];
