// app/(app)/my-tasks/page.tsx
"use client";

import { PageHeader } from "@/components/common/page-header";
import { KanbanCard } from "@/components/tasks/KanbanCard";
import { useMyTasks } from "@/hooks/use-my-tasks";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyTasksPage() {
  const { tasks, isLoading, isError } = useMyTasks();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Mis Tareas Asignadas"
        description="Aquí se muestran todas las tareas que están bajo tu responsabilidad."
      />
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-[210px] w-full" />
          <Skeleton className="h-[210px] w-full" />
        </div>
      )}
      {isError && (
        <p className="text-destructive">Error al cargar tus tareas.</p>
      )}

      <div className="space-y-4">
        {tasks && tasks.length > 0
          ? tasks.map((task) => <KanbanCard key={task._id} task={task} />)
          : !isLoading && (
              <p className="text-center text-muted-foreground py-8">
                No tienes tareas asignadas.
              </p>
            )}
      </div>
    </div>
  );
}
