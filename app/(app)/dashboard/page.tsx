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
  CheckCircle2,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTaskSummary } from "@/hooks/use-task-summary";
import { useTaskFilters } from "@/hooks/use-task-filters";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMyTasks } from "@/hooks/use-my-tasks";
import { UserRole, TaskStatus } from "@/types";
import { isToday, isPast } from "date-fns";

// ─── Shared KPI cards used by admin/supervisor/planificador ─────────────────

function KpiCards() {
  const { summary, isLoading } = useTaskSummary();
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle>
          <ListTodo className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : summary?.pending}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : summary?.inProgress}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Criticidad Alta</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : summary?.highCriticality}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tareas Vencidas</CardTitle>
          <Clock className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {isLoading ? "..." : summary?.overdue}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── TECNICO view ────────────────────────────────────────────────────────────

function TecnicoDashboard({ userName }: { userName: string }) {
  const { tasks, isLoading } = useMyTasks();

  const stats = useMemo(() => {
    if (!tasks) return { total: 0, dueToday: 0, overdue: 0 };
    const active = tasks.filter(
      (t) => t.status !== TaskStatus.COMPLETADA && t.status !== TaskStatus.CANCELADA
    );
    return {
      total: tasks.length,
      dueToday: active.filter((t) => isToday(new Date(t.dueDate))).length,
      overdue: active.filter((t) => isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))).length,
    };
  }, [tasks]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Mis Tareas Activas
        </h1>
        <p className="text-muted-foreground">Bienvenido, {userName}</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Asignadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencen Hoy</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {isLoading ? "..." : stats.dueToday}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {isLoading ? "..." : stats.overdue}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task list — renders the kanban filtered to my tasks via /tasks/my endpoint */}
      <KanbanBoard filters={{}} />
    </div>
  );
}

// ─── EHS / SEGURIDAD_PATRIMONIAL view ────────────────────────────────────────

function EhsDashboard() {
  return (
    <div className="flex flex-col gap-8">
      <KpiCards />

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Filtro activo:</span>
        <Badge variant="secondary">Solo tareas activas</Badge>
      </div>

      <KanbanBoard
        filters={{ status: [TaskStatus.PENDIENTE, TaskStatus.EN_PROGRESO] }}
      />
    </div>
  );
}

// ─── ADMIN / SUPERVISOR / PLANIFICADOR view (unchanged) ──────────────────────

function AdminDashboard() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { searchTerm, setSearchTerm, debouncedSearchTerm } = useTaskFilters();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const CreateTaskButton = () => (
    <Button asChild className="w-full md:w-auto">
      <Link href="/tasks/new">
        <PlusCircle className="h-4 w-4 mr-2" />
        Crear Tarea
      </Link>
    </Button>
  );

  const CreateTaskDialog = () => (
    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
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
          <TaskForm onSuccess={() => setIsCreateModalOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="flex flex-col gap-8">
      <KpiCards />

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

      <KanbanBoard filters={{ search: debouncedSearchTerm }} />
    </div>
  );
}

// ─── Root page ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role as UserRole | undefined;

  if (role === UserRole.TECNICO) {
    return <TecnicoDashboard userName={user?.name ?? "Técnico"} />;
  }

  if (role === UserRole.EHS || role === UserRole.SEGURIDAD_PATRIMONIAL) {
    return <EhsDashboard />;
  }

  // admin, supervisor, planificador (and loading state — show full view)
  return <AdminDashboard />;
}
