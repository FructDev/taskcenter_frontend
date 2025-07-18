// src/components/tasks/KanbanBoard.tsx
"use client";
import { useTasks } from "@/hooks/use-tasks";
import { useMemo } from "react";
import { KanbanCard } from "./KanbanCard";
import { TaskStatus, TaskType } from "@/types";
// Importaciones para Drag and Drop que dejaremos listas
import {
  DndContext,
  DragEndEvent,
  // DragEndEvent,
  DragOverlay,
  DragStartEvent,
  // DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn"; // Lo necesitaremos de nuevo
import { createPortal } from "react-dom";
import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/handle-error";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface KanbanBoardProps {
  filters: {
    search?: string;
    status?: TaskStatus | TaskStatus[];
  };
}

const MAX_CARDS_PER_COLUMN = 5;

export function KanbanBoard({ filters }: KanbanBoardProps) {
  const { tasks, isLoading, mutate } = useTasks(filters);
  // const [activeTask] = useState<TaskType | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);

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
      [TaskStatus.COMPLETADA]: sortedTasks.filter(
        (t) => t.status === TaskStatus.COMPLETADA
      ),
    };
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveTask(event.active.data.current?.task as TaskType);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null); // Limpiamos la tarea activa
    const { active, over } = event;

    // Si no se soltó sobre una columna válida, no hacemos nada
    if (!over) return;

    const originalTask = active.data.current?.task as TaskType;
    const newStatus = over.id as TaskStatus;

    // Si se soltó en la misma columna, no hacemos nada
    if (originalTask.status === newStatus) return;

    try {
      // Llamada a la API según el nuevo estado
      if (newStatus === TaskStatus.EN_PROGRESO) {
        await api.post(`/tasks/${originalTask._id}/start`);
      } else if (newStatus === TaskStatus.COMPLETADA) {
        await api.post(`/tasks/${originalTask._id}/complete`);
      } else {
        // Para otros cambios (ej. de vuelta a pendiente) usamos PATCH
        await api.patch(`/tasks/${originalTask._id}`, { status: newStatus });
      }

      // Mutate le dice a SWR que los datos han cambiado y debe recargarlos
      mutate();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error("Error al actualizar la tarea", error);
      // Si hay un error, forzamos una recarga para revertir cualquier cambio optimista
      toast.error("Acción no permitida", {
        description: errorMessage,
      });
      mutate();
    }
  }

  if (isLoading) return <div>Cargando tablero...</div>;

  if (isDesktop) {
    return (
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          <KanbanColumn
            status={TaskStatus.PENDIENTE}
            title="Pendiente"
            tasks={columns.pendiente}
            maxTasks={MAX_CARDS_PER_COLUMN}
          />
          <KanbanColumn
            status={TaskStatus.EN_PROGRESO}
            title="En Progreso"
            tasks={columns["en progreso"]}
            maxTasks={MAX_CARDS_PER_COLUMN}
          />
          <KanbanColumn
            status={TaskStatus.PAUSADA}
            title="Pausada"
            tasks={columns.pausada}
            maxTasks={MAX_CARDS_PER_COLUMN}
          />
          <KanbanColumn
            status={TaskStatus.COMPLETADA}
            title="Completada"
            tasks={columns.completada}
            maxTasks={MAX_CARDS_PER_COLUMN}
          />
        </div>
        {createPortal(
          <DragOverlay>
            {activeTask ? <KanbanCard task={activeTask} /> : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    );
  }

  // --- VISTA PARA MÓVIL (NUEVA INTERFAZ DE PESTAÑAS) ---
  return (
    <Tabs defaultValue={TaskStatus.PENDIENTE} className="w-full">
      {/* 1. Envolvemos la lista en un div que permite scroll horizontal */}
      <div className="w-full overflow-x-auto pb-2">
        {/* 2. Le damos a la lista un ancho basado en su contenido y un espacio */}
        <TabsList className="grid w-max grid-cols-4 gap-2">
          <TabsTrigger value={TaskStatus.PENDIENTE}>
            Pendiente ({columns.pendiente.length})
          </TabsTrigger>
          <TabsTrigger value={TaskStatus.EN_PROGRESO}>
            En Progreso ({columns["en progreso"].length})
          </TabsTrigger>
          <TabsTrigger value={TaskStatus.PAUSADA}>
            Pausada ({columns.pausada.length})
          </TabsTrigger>
          <TabsTrigger value={TaskStatus.COMPLETADA}>
            Completada ({columns.completada.length})
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="pendiente" className="mt-4">
        <div className="space-y-4">
          {columns.pendiente.map((task) => (
            <KanbanCard key={task._id} task={task} />
          ))}
        </div>
      </TabsContent>
      <TabsContent value="en progreso" className="mt-4">
        <div className="space-y-4">
          {columns["en progreso"].map((task) => (
            <KanbanCard key={task._id} task={task} />
          ))}
        </div>
      </TabsContent>
      <TabsContent value="pausada" className="mt-4">
        <div className="space-y-4">
          {columns.pausada.map((task) => (
            <KanbanCard key={task._id} task={task} />
          ))}
        </div>
      </TabsContent>
      <TabsContent value="completada" className="mt-4">
        <div className="space-y-4">
          {columns.completada.map((task) => (
            <KanbanCard key={task._id} task={task} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
