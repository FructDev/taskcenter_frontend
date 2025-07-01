// app/(app)/tasks/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
// import { ColumnDef } from "@tanstack/react-table";
import { PlusCircle } from "lucide-react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { useTasks } from "@/hooks/use-tasks";
import { useTaskFilters } from "@/hooks/use-task-filters";
import { TaskType } from "@/types";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/handle-error";

import { PageHeader } from "@/components/common/page-header";
import { TasksDataTable } from "@/components/tasks/TasksDataTable";
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
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { debouncedSearchTerm, searchTerm, setSearchTerm } = useTaskFilters();
  const { mutate } = useTasks({
    search: debouncedSearchTerm,
  });

  // --- LÓGICA COMPLETA DE ESTADO Y MANEJADORES ---
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | undefined>(
    undefined
  );

  const handleAddNew = () => {
    setSelectedTask(undefined);
    setIsFormModalOpen(true);
  };

  const handleEdit = (task: TaskType) => {
    setSelectedTask(task);
    setIsFormModalOpen(true);
  };

  const handleDeleteAttempt = (task: TaskType) => {
    setSelectedTask(task);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTask) return;
    try {
      await api.delete(`/tasks/${selectedTask._id}`);
      toast.success("Tarea eliminada correctamente.");
      mutate(); // Refresca la lista
    } catch (error) {
      toast.error("Error al eliminar la tarea", {
        description: getErrorMessage(error),
      });
    }
  };
  // --- FIN DE LA LÓGICA ---

  const modalTitle = selectedTask ? "Editar Tarea" : "Crear Nueva Tarea";

  // Componente para el botón de Crear Tarea, para no repetir JSX
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
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Gestión de Tareas"
          description="Busca, filtra y gestiona todas las tareas."
          actionButton={<CreateTaskAction />}
        />
        <div className="flex items-center gap-4">
          <Input
            type="search"
            placeholder="Buscar por título..."
            className="w-full md:max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <TasksDataTable
          filters={{ search: debouncedSearchTerm }}
          onEdit={handleEdit}
          onDelete={handleDeleteAttempt}
        />
      </div>

      {/* MODAL PARA CREAR/EDITAR */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogDescription>
              {modalTitle === "Editar Tarea"
                ? "Modifica los detalles de la tarea."
                : "Completa los campos para registrar una nueva tarea."}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto p-1 pr-6">
            <TaskForm
              taskToEdit={selectedTask}
              onSuccess={() => {
                setIsFormModalOpen(false);
                mutate();
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO DE CONFIRMACIÓN PARA ELIMINAR */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminará permanentemente la
              tarea{" "}
              <span className="font-bold">
                &quot;{selectedTask?.title}&quot;
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
