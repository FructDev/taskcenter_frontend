// app/(wallboard)/wallboard/page.tsx
"use client";
import { useTaskSummary } from "@/hooks/use-task-summary";
import { useTasks } from "@/hooks/use-tasks";
import { TaskStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, Clock, ListTodo } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { WallboardColumn } from "@/components/wallboard/WallboardColumn";

const REFRESH_INTERVAL_MS = 60000; // Refrescar cada 60 segundos

export default function WallboardPage() {
  const { summary, isLoading: isLoadingSummary } =
    useTaskSummary(REFRESH_INTERVAL_MS);
  const { tasks } = useTasks({
    refreshInterval: REFRESH_INTERVAL_MS,
  });

  const columns = useMemo(() => {
    const sortedTasks =
      tasks?.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      ) || [];
    return {
      [TaskStatus.PENDIENTE]: sortedTasks.filter(
        (t) => t.status === TaskStatus.PENDIENTE
      ),
      [TaskStatus.EN_PROGRESO]: sortedTasks.filter(
        (t) => t.status === TaskStatus.EN_PROGRESO
      ),
      [TaskStatus.PAUSADA]: sortedTasks.filter(
        (t) => t.status === TaskStatus.PAUSADA
      ),
    };
  }, [tasks]);

  const kpiCards = [
    { title: "Tareas Pendientes", value: summary?.pending, icon: ListTodo },
    { title: "En Progreso", value: summary?.inProgress, icon: Activity },
    {
      title: "Criticidad Alta",
      value: summary?.highCriticality,
      icon: AlertTriangle,
      isDestructive: true,
    },
    {
      title: "Tareas Vencidas",
      value: summary?.overdue,
      icon: Clock,
      isDestructive: true,
    },
  ];

  return (
    <main className="p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">
          Centro de Control Operativo
        </h1>
        <p className="text-md text-gray-500 dark:text-gray-400">
          La información se actualiza automáticamente
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {kpiCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon
                className={`h-4 w-4 ${
                  card.isDestructive
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              />
            </CardHeader>
            <CardContent>
              <div
                className={`text-4xl font-bold ${
                  card.isDestructive ? "text-destructive" : ""
                }`}
              >
                {isLoadingSummary ? (
                  <Skeleton className="h-10 w-16" />
                ) : (
                  card.value
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <WallboardColumn title="Pendiente" tasks={columns.pendiente} />
        <WallboardColumn title="En Progreso" tasks={columns["en progreso"]} />
        <WallboardColumn title="Pausada" tasks={columns.pausada} />
      </div>
    </main>
  );
}
