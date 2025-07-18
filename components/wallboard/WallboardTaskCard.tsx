"use client";
import { TaskType } from "@/types";
import { cn } from "@/lib/utils";
import { Check, MapPin } from "lucide-react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "../ui/badge";

const getUrgencyStyles = (task: TaskType): string => {
  // 1. Manejar estados finales (inactivos)
  if (task.status === "completada" || task.status === "cancelada") {
    return "bg-slate-100 dark:bg-slate-800/30 opacity-70 border-l-4 border-transparent";
  }

  // 2. Manejar estados informativos
  if (task.status === "pausada") {
    return "bg-sky-500/5 dark:bg-sky-500/10 border-l-4 border-l-sky-500";
  }

  // Si no hay fecha de vencimiento, es neutral
  if (!task.dueDate) {
    return "bg-card border-l-4 border-transparent";
  }

  const date = new Date(task.dueDate);

  // 3. Sistema de "Semáforo" para la urgencia
  if (isPast(date) && !isToday(date)) {
    return "bg-red-500/5 dark:bg-red-500/10 border-l-4 border-l-red-500"; // Vencida
  }
  if (isToday(date)) {
    return "bg-orange-500/5 dark:bg-orange-500/10 border-l-4 border-l-orange-500"; // Vence Hoy
  }
  if (isTomorrow(date)) {
    return "bg-yellow-500/5 dark:bg-yellow-500/10 border-l-4 border-l-yellow-500"; // Vence Mañana
  }

  // 4. El nuevo estado para tareas "a tiempo"
  return "bg-green-500/5 dark:bg-green-500/10 border-l-4 border-l-green-500"; // A Tiempo
};

export function WallboardTaskCard({ task }: { task: TaskType }) {
  if (!task) return null; // Guardia de seguridad

  const dueDate = new Date(task.dueDate);
  const isOverdue = isPast(dueDate) && !isToday(dueDate);
  const isDueToday = isToday(dueDate);
  const isDueTomorrow = isTomorrow(dueDate);

  // 1. Lógica para verificar si hay un parte diario para hoy
  const hasDailyLogToday = task.dailyLogs?.some((log) =>
    isToday(new Date(log.createdAt))
  );

  return (
    <div
      className={cn(
        "p-3 rounded-lg bg-card border text-sm shadow-sm",
        getUrgencyStyles(task)
      )}
    >
      {/* Fila 1: Título y la nueva insignia de Revalidación */}
      <div className="flex justify-between items-start gap-2">
        <p className="font-semibold break-words">{task.title}</p>
        {/* 2. Se muestra la insignia si la tarea fue revalidada hoy */}
        {hasDailyLogToday && (
          <Badge
            variant="default"
            className="bg-blue-600 text-white whitespace-nowrap text-xs h-5"
          >
            <Check className="h-3 w-3 mr-1" /> Revalidada
          </Badge>
        )}
      </div>

      {/* Fila 2: Ubicación */}
      <p className="text-xs text-muted-foreground mt-1.5 truncate flex items-center">
        <MapPin className="h-3 w-3 mr-1.5 shrink-0" />
        {task.location.name}
      </p>

      {/* Fila 3: Footer con Asignado, Fecha de Creación y Vencimiento */}
      <div className="flex justify-between items-end mt-2 text-xs text-muted-foreground pt-2 border-t">
        <div className="truncate">
          <p className="font-medium">
            {task.assignedTo?.name ||
              task.contractorAssociated?.companyName ||
              "Sin Asignar"}
          </p>
          {/* 3. Mostramos la fecha de creación absoluta */}
          <p>
            Creada: {format(new Date(task.createdAt), "dd MMM", { locale: es })}
          </p>
        </div>
        <div
          className={cn(
            "text-right font-semibold whitespace-nowrap",
            isOverdue && "text-red-500",
            isDueToday && "text-orange-500",
            isDueTomorrow && "text-yellow-600"
          )}
        >
          Vence: {format(dueDate, "dd MMM", { locale: es })}
        </div>
      </div>
    </div>
  );
}
