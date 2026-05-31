// src/components/tasks/KanbanColumn.tsx
"use client";
import { useDroppable } from "@dnd-kit/core";
import { TaskStatus, TaskType } from "@/types";
import { KanbanCard } from "./KanbanCard";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { isPast, isToday } from "date-fns";
import { ClipboardList } from "lucide-react";

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: TaskType[];
  maxTasks: number;
}

export function KanbanColumn({ status, title, tasks, maxTasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const overdueCount = tasks.filter((t) => {
    const active = t.status !== "completada" && t.status !== "cancelada";
    return active && t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate));
  }).length;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col bg-muted/50 rounded-lg p-4 transition-colors",
        isOver && "bg-primary/10"
      )}
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b">
        <h2 className="text-xl font-semibold capitalize">
          {title}{" "}
          <span className="font-light text-muted-foreground text-base">
            ({tasks.length})
          </span>
        </h2>
        {overdueCount > 0 && (
          <Badge variant="destructive" className="text-xs">
            {overdueCount} vencida{overdueCount > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <div className="flex-1 space-y-4">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground gap-2">
            <ClipboardList className="h-8 w-8 opacity-30" />
            <p className="text-sm">Sin tareas</p>
          </div>
        ) : (
          <>
            {tasks.slice(0, maxTasks).map((task) => (
              <KanbanCard key={task._id} task={task} />
            ))}
            {tasks.length > maxTasks && (
              <Button variant="secondary" className="w-full" asChild>
                <Link href={`/tasks?status=${status}`}>
                  Ver las {tasks.length - maxTasks} restantes
                </Link>
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
