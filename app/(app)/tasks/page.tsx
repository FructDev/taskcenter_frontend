// app/(app)/tasks/page.tsx
"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { useTasks } from "@/hooks/use-tasks";
import { useTaskFilters } from "@/hooks/use-task-filters";
import { TaskType, TaskStatus } from "@/types";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/handle-error";

import { PageHeader } from "@/components/common/page-header";
import { TasksDataTable } from "@/components/tasks/TasksDataTable";
import { TaskFiltersBar } from "@/components/tasks/TaskFiltersBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TaskForm } from "@/components/tasks/TaskForm";

export default function TasksPage() {
  return (
    <Suspense>
      <TasksPageContent />
    </Suspense>
  );
}

function TasksPageContent() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { debouncedSearchTerm, searchTerm, setSearchTerm } = useTaskFilters();

  const [status, setStatus] = useState("");
  const [criticality, setCriticality] = useState("");
  const [taskType, setTaskType] = useState("");

  const filters = {
    search: debouncedSearchTerm,
    ...(status && { status: status as TaskStatus }),
    ...(criticality && { criticality }),
    ...(taskType && { taskType }),
  };

  const { mutate } = useTasks(filters);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | undefined>(undefined);

  const handleAddNew = () => { setSelectedTask(undefined); setIsFormModalOpen(true); };
  const handleEdit = (task: TaskType) => { setSelectedTask(task); setIsFormModalOpen(true); };
  const handleDeleteAttempt = (task: TaskType) => { setSelectedTask(task); setIsDeleteAlertOpen(true); };

  const handleDeleteConfirm = async () => {
    if (!selectedTask) return;
    try {
      await api.delete(`/tasks/${selectedTask._id}`);
      toast.success("Tarea eliminada correctamente.");
      mutate();
    } catch (error) {
      toast.error("Error al eliminar la tarea", { description: getErrorMessage(error) });
    }
  };

  const modalTitle = selectedTask ? "Editar Tarea" : "Crear Nueva Tarea";

  const CreateTaskAction = () =>
    isDesktop ? (
      <Button onClick={handleAddNew}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Crear Tarea
      </Button>
    ) : (
      <Button asChild>
        <Link href="/tasks/new">
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Tarea
        </Link>
      </Button>
    );

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Gestión de Tareas"
          description="Busca, filtra y gestiona todas las tareas."
          actionButton={<CreateTaskAction />}
        />

        <div className="flex flex-col gap-3">
          <Input
            type="search"
            placeholder="Buscar por título..."
            className="w-full md:max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <TaskFiltersBar
            status={status}
            criticality={criticality}
            taskType={taskType}
            onStatusChange={setStatus}
            onCriticalityChange={setCriticality}
            onTaskTypeChange={setTaskType}
            onClearAll={() => { setStatus(""); setCriticality(""); setTaskType(""); }}
          />
        </div>

        <TasksDataTable
          filters={filters}
          onEdit={handleEdit}
          onDelete={handleDeleteAttempt}
        />
      </div>

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogDescription>
              {selectedTask ? "Modifica los detalles de la tarea." : "Completa los campos para registrar una nueva tarea."}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto p-1 pr-6">
            <TaskForm
              taskToEdit={selectedTask}
              onSuccess={() => { setIsFormModalOpen(false); mutate(); }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminará permanentemente la tarea{" "}
              <span className="font-bold">&quot;{selectedTask?.title}&quot;</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

