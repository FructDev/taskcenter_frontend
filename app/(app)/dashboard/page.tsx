// app/(app)/dashboard/page.tsx
"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TaskForm } from "@/components/tasks/TaskForm";
import {
  AlertTriangle,
  Clock,
  ListTodo,
  PlusCircle,
  Activity,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { KanbanBoard } from "@/components/tasks/KanbanBoard"; // Importamos el Kanban
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskSummary } from "@/hooks/use-task-summary";
import { useTaskFilters } from "@/hooks/use-task-filters";
import { Input } from "@/components/ui/input";
// import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { summary, isLoading: isLoadingSummary } = useTaskSummary();
  const { searchTerm, setSearchTerm, debouncedSearchTerm } = useTaskFilters();

  const CreateTaskButton = () => (
    <Button asChild className="w-full md:w-auto">
      <Link href="/tasks/new">
        <PlusCircle className="h-4 w-4 mr-2" />
        Crear Tarea
      </Link>
    </Button>
  );

  const CreateTaskDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Crear Tarea
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Tarea</DialogTitle>
          <DialogDescription>
            Complete los detalles para registrar una nueva tarea.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-1 pr-6">
          <TaskForm />
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="flex flex-col gap-8">
      {/* SECCIÓN DE TARJETAS KPI (Restaurada) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tareas Pendientes
            </CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingSummary ? "..." : summary?.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingSummary ? "..." : summary?.inProgress}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Criticidad Alta
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingSummary ? "..." : summary?.highCriticality}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tareas Vencidas
            </CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {isLoadingSummary ? "..." : summary?.overdue}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-auto md:flex-1">
          <Input
            type="search"
            placeholder="Buscar tareas por título..."
            className="w-full md:max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-auto">
          {isDesktop ? <CreateTaskDialog /> : <CreateTaskButton />}
        </div>
      </div>

      {/* SECCIÓN DEL TABLERO KANBAN */}
      <KanbanBoard filters={{ search: debouncedSearchTerm }} />
    </div>
  );
}
