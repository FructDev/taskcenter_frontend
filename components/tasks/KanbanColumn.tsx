// src/components/tasks/KanbanColumn.tsx
"use client";
import { useDroppable } from "@dnd-kit/core";
import { TaskStatus, TaskType } from "@/types";
import { KanbanCard } from "./KanbanCard";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import Link from "next/link";

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: TaskType[];
  maxTasks: number;
}

export function KanbanColumn({
  status,
  title,
  tasks,
  maxTasks,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col",
        "bg-muted/50 rounded-lg p-4 transition-colors",
        isOver ? "bg-primary/10" : ""
      )}
    >
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b capitalize">
        {title}{" "}
        <span className="font-light text-muted-foreground text-base">
          ({tasks.length})
        </span>
      </h2>
      <div className="flex-1 space-y-4">
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
      </div>
    </div>
  );
}
