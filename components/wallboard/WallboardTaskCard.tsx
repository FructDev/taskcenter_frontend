// src/components/wallboard/WallboardTaskCard.tsx
"use client";
import { TaskType } from "@/types";
import { cn } from "@/lib/utils";
import { CalendarDays, MapPin } from "lucide-react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale";

const getUrgencyStyles = (task: TaskType): string => {
  if (task.status === "completada")
    return "bg-slate-100 dark:bg-slate-800/50 opacity-70 border-slate-500/30";
  if (task.status === "pausada") return "bg-sky-500/10 border-sky-500/40";
  if (!task.dueDate) return "bg-card";
  const date = new Date(task.dueDate);
  if (isPast(date) && !isToday(date))
    return "bg-destructive/10 border-destructive/50";
  if (isToday(date)) return "bg-orange-500/10 border-orange-500/50";
  if (isTomorrow(date)) return "bg-yellow-500/10 border-yellow-500/50";
  return "bg-green-100";
};

export function WallboardTaskCard({ task }: { task: TaskType }) {
  const dueDate = new Date(task.dueDate);

  const isDueToday = isToday(dueDate) && task.status !== "completada";
  const isDueTomorrow = isTomorrow(dueDate) && task.status !== "completada";

  const isOverdue =
    isPast(new Date(task.dueDate)) &&
    !isToday(new Date(task.dueDate)) &&
    task.status !== "completada";
  return (
    <div
      className={cn(
        "p-3 rounded-lg bg-card border text-sm shadow-sm",
        getUrgencyStyles(task)
      )}
    >
      <p className="font-semibold break-words">{task.title}</p>

      {/* 1. AÑADIMOS LA UBICACIÓN */}
      <p className="text-xs text-muted-foreground mt-1 truncate flex items-center">
        <MapPin className="h-3 w-3 mr-1.5 shrink-0" />
        {task.location.name}
      </p>

      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
        <p className="truncate">
          {task.assignedTo?.name ||
            task.contractorAssociated?.companyName ||
            "Sin Asignar"}
        </p>

        {/* 2. AÑADIMOS ETIQUETA "VENCE" Y COLORES DINÁMICOS */}
        <div
          className={cn(
            "flex items-center gap-1 font-medium",
            isOverdue && "text-red-500",
            isDueToday && "text-orange-500",
            isDueTomorrow && "text-yellow-600"
          )}
        >
          <CalendarDays className="h-3 w-3" />
          <span>Vence: {format(dueDate, "dd MMM", { locale: es })}</span>
        </div>
      </div>
    </div>
  );
}
