// src/components/tasks/KanbanBoard.tsx
"use client";
import { useTasks } from "@/hooks/use-tasks";
import { useMemo } from "react";
import { KanbanCard } from "./KanbanCard";
import { FailureReportType, TaskStatus, TaskType, TaskTypeEnum } from "@/types";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { createPortal } from "react-dom";
import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/handle-error";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { PpeChecklistDialog } from "./PpeChecklistDialog";
import { FailureReportDialog } from "./FailureReportDialog";

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
  const [pendingStartTask, setPendingStartTask] = useState<TaskType | null>(null);
  const [isPpeDialogOpen, setIsPpeDialogOpen] = useState(false);
  const [pendingCompleteTask, setPendingCompleteTask] = useState<TaskType | null>(null);
  const [isFailureReportOpen, setIsFailureReportOpen] = useState(false);

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

  async function executeStatusChange(
    task: TaskType,
    newStatus: TaskStatus,
    failureData?: FailureReportType
  ) {
    try {
      if (newStatus === TaskStatus.EN_PROGRESO) {
        await api.post(`/tasks/${task._id}/start`);
      } else if (newStatus === TaskStatus.COMPLETADA) {
        await api.post(`/tasks/${task._id}/complete`, {
          failureReport: failureData,
        });
      } else {
        await api.patch(`/tasks/${task._id}`, { status: newStatus });
      }
      mutate();
    } catch (error) {
      toast.error("Acción no permitida", { description: getErrorMessage(error) });
      mutate();
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const originalTask = active.data.current?.task as TaskType;
    const newStatus = over.id as TaskStatus;

    if (originalTask.status === newStatus) return;

    // Interceptar inicio: verificar EPP
    if (
      newStatus === TaskStatus.EN_PROGRESO &&
      originalTask.requiredPpe &&
      originalTask.requiredPpe.length > 0
    ) {
      setPendingStartTask(originalTask);
      setIsPpeDialogOpen(true);
      return;
    }

    // Interceptar completar: pedir reporte si es tarea correctiva
    if (newStatus === TaskStatus.COMPLETADA) {
      if (originalTask.taskType === TaskTypeEnum.CORRECTIVO) {
        setPendingCompleteTask(originalTask);
        setIsFailureReportOpen(true);
        return;
      }
    }

    await executeStatusChange(originalTask, newStatus);
  }

  if (isLoading) return <div>Cargando tablero...</div>;

  const ppeDialog = (
    <PpeChecklistDialog
      isOpen={isPpeDialogOpen}
      onOpenChange={(open) => {
        setIsPpeDialogOpen(open);
        if (!open) setPendingStartTask(null);
      }}
      requiredPpe={pendingStartTask?.requiredPpe || []}
      onConfirm={async () => {
        if (pendingStartTask) {
          await executeStatusChange(pendingStartTask, TaskStatus.EN_PROGRESO);
          setPendingStartTask(null);
        }
      }}
    />
  );

  const failureReportDialog = (
    <FailureReportDialog
      isOpen={isFailureReportOpen}
      onOpenChange={(open) => {
        setIsFailureReportOpen(open);
        if (!open) setPendingCompleteTask(null);
      }}
      onConfirm={async (failureData) => {
        if (pendingCompleteTask) {
          await executeStatusChange(
            pendingCompleteTask,
            TaskStatus.COMPLETADA,
            failureData
          );
          setPendingCompleteTask(null);
        }
      }}
    />
  );

  if (isDesktop) {
    return (
      <>
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
      {ppeDialog}
      {failureReportDialog}
</>
    );
  }

  // --- VISTA PARA MÓVIL (NUEVA INTERFAZ DE PESTAÑAS) ---
  return (
    <>
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
    {ppeDialog}
  </>
  );
}
