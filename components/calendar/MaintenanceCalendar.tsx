"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { useTasks } from "@/hooks/use-tasks";
import {
  EventInput,
  EventDropArg,
  DatesSetArg,
  EventClickArg,
  // DateClickArg,
} from "@fullcalendar/core";
import api from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import { TaskType, TaskStatus } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { format, isPast, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "../ui/badge";
import {
  CalendarClock,
  FilePlus2,
  Link as LinkIcon,
  MapPin,
  User,
} from "lucide-react";
import { ScheduledTaskForm } from "../scheduled-tasks/ScheduledTaskForm";
import { TaskForm } from "../tasks/TaskForm";

const statusColors: Record<string, string> = {
  [TaskStatus.PENDIENTE]: "#f59e0b",
  [TaskStatus.EN_PROGRESO]: "#3b82f6",
  [TaskStatus.PAUSADA]: "#64748b",
  [TaskStatus.COMPLETADA]: "#16a34a",
  [TaskStatus.CANCELADA]: "#ef4444",
};

// Componente mejorado para el detalle de la tarea en el modal
const TaskDetailPopover = ({ task }: { task: TaskType }) => (
  <div className="space-y-3 p-4">
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">{task.location.name}</span>
    </div>
    <div className="flex items-center gap-2">
      <User className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">
        {task.assignedTo?.name ||
          task.contractorAssociated?.companyName ||
          "N/A"}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <Badge className="capitalize">{task.status.replace(/_/g, " ")}</Badge>
    </div>
  </div>
);

export function MaintenanceCalendar() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const { tasks, isLoading, mutate } = useTasks({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);

  const events: EventInput[] = useMemo(
    () =>
      tasks?.map((task) => ({
        id: task._id,
        title: task.title,
        start: new Date(task.dueDate),
        allDay: true,
        backgroundColor: statusColors[task.status] || "#a1a1aa",
        borderColor: statusColors[task.status] || "#a1a1aa",
      })) || [],
    [tasks]
  );

  const handleDatesSet = (arg: DatesSetArg) =>
    setDateRange({
      start: arg.start.toISOString(),
      end: arg.end.toISOString(),
    });
  const handleEventDrop = async (info: EventDropArg) => {
    const { event } = info;
    const newDueDate = event.start;
    if (!newDueDate) return;

    mutate(
      tasks?.map((t) =>
        t._id === event.id ? { ...t, dueDate: newDueDate.toISOString() } : t
      ),
      false
    );

    try {
      await api.patch(`/tasks/${event.id}`, {
        dueDate: newDueDate.toISOString(),
      });
      toast.success(`Tarea "${event.title}" reprogramada.`);
    } catch (error) {
      toast.error("Error al reprogramar la tarea.");
      toast.error(
        `Error: ${error instanceof Error ? error.message : "Desconocido"}`
      );
      //
      info.revert();
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    clickInfo.jsEvent.preventDefault();
    const task = tasks?.find((t) => t._id === clickInfo.event.id);
    if (task) setSelectedTask(task);
  };
  const handleDateClick = (clickInfo: DateClickArg) => {
    const clickedDate = new Date(clickInfo.date);

    // Si la fecha es pasada (y no es hoy), muestra un error y no hagas nada.
    if (isPast(clickedDate) && !isToday(clickedDate)) {
      toast.error("No se pueden crear tareas o reglas en fechas pasadas.");
      return;
    }

    // Si la fecha es válida, abre el modal de creación.
    setSelectedDate(clickInfo.dateStr);
  };

  if (isLoading && !tasks) return <Skeleton className="h-full w-full" />;

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        locale={esLocale}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek",
        }}
        events={events}
        editable={true}
        selectable={true}
        eventDrop={handleEventDrop}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        datesSet={handleDatesSet}
        height="100%"
      />

      {/* Modal para ver detalles de una tarea existente (diseño mejorado) */}
      <Dialog
        open={!!selectedTask}
        onOpenChange={(isOpen) => !isOpen && setSelectedTask(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          {selectedTask && <TaskDetailPopover task={selectedTask} />}
          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => router.push(`/tasks/${selectedTask?._id}`)}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Ir a la Tarea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de ELECCIÓN para crear una nueva tarea */}
      {/* Modal de ELECCIÓN para crear (lógica de botones modificada) */}
      <Dialog
        open={!!selectedDate}
        onOpenChange={(isOpen) => !isOpen && setSelectedDate(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Crear para el{" "}
              {selectedDate &&
                format(new Date(selectedDate), "dd 'de' MMMM", { locale: es })}
            </DialogTitle>
            <DialogDescription>
              Elige el tipo de entrada que deseas crear.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => {
                setIsTaskFormOpen(true);
                setSelectedDate(null);
              }}
            >
              <FilePlus2 className="h-6 w-6" />
              <div>
                <p className="font-semibold">Crear Tarea Única</p>
                <p className="text-xs text-muted-foreground">
                  Para un trabajo puntual.
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => {
                setIsScheduleFormOpen(true);
                setSelectedDate(null);
              }}
            >
              <CalendarClock className="h-6 w-6" />
              <div>
                <p className="font-semibold">Programar Tarea</p>
                <p className="text-xs text-muted-foreground">
                  Para una regla recurrente.
                </p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- NUEVOS MODALES PARA LOS FORMULARIOS --- */}

      {/* Modal para el Formulario de Tarea Única */}
      <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Crear Nueva Tarea</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto p-1 pr-6">
            <TaskForm
              defaultDate={selectedDate || undefined}
              onSuccess={() => {
                setIsTaskFormOpen(false);
                mutate(); // Refresca el calendario
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para el Formulario de Tarea Programada */}
      <Dialog open={isScheduleFormOpen} onOpenChange={setIsScheduleFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nueva Regla Programada</DialogTitle>
          </DialogHeader>
          <div className="max-h-[75vh] overflow-y-auto p-1 pr-6">
            <ScheduledTaskForm
              defaultDate={selectedDate || undefined}
              onSuccess={() => {
                setIsScheduleFormOpen(false);
                // No necesitamos refrescar el calendario para las reglas
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
