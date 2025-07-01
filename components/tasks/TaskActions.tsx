// src/components/tasks/TaskActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { TaskType } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/handle-error";
import { useTasks } from "@/hooks/use-tasks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { TaskForm } from "./TaskForm";

interface TaskActionsProps {
  task: TaskType;
}

export function TaskActions({ task }: TaskActionsProps) {
  const router = useRouter();
  const { mutate } = useTasks(); // Obtenemos mutate para refrescar la lista
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await api.delete(`/tasks/${task._id}`);
      toast.success("Tarea eliminada correctamente.");
      mutate(); // Forzamos la recarga de la lista de tareas
    } catch (error) {
      toast.error("Error al eliminar la tarea", {
        description: getErrorMessage(error),
      });
    }
  };

  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/tasks/${task._id}`)}>
              Ver Detalles
            </DropdownMenuItem>

            {/* 4. El botón de editar ahora abre el Dialog */}
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Editar Tarea
              </DropdownMenuItem>
            </DialogTrigger>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onSelect={() => setIsDeleteDialogOpen(true)}
            >
              Eliminar Tarea
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Contenido del Modal de Edición */}
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Editar Tarea</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la tarea a continuación.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto p-1 pr-6">
            <TaskForm
              taskToEdit={task}
              onSuccess={() => {
                mutate(); // Refresca la lista de tareas
                setIsEditDialogOpen(false); // Cierra el modal
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la tarea
              <span className="font-bold"> &quot;{task.title}&quot;</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
