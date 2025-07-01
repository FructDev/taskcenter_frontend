// src/components/tasks/KanbanCard.tsx
"use client";

import { TaskType } from "@/types";
import { CSS } from "@dnd-kit/utilities";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  format,
  formatDistanceToNow,
  isPast,
  isToday,
  isTomorrow,
} from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  MapPin,
  MessageSquare,
  Paperclip,
  User,
} from "lucide-react";
import Link from "next/link";
import { TaskActions } from "./TaskActions";
import { useDraggable } from "@dnd-kit/core";

interface KanbanCardProps {
  task: TaskType;
  isDragging?: boolean;
}

// La lógica de estilos de fondo por urgencia
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

// La función de contexto de tiempo que te gustó
const getTimeContext = (task: TaskType): string => {
  if (task.status === "completada" && task.completedAt) {
    return `Completada ${formatDistanceToNow(new Date(task.completedAt), {
      locale: es,
      addSuffix: true,
    })}`;
  }
  if (task.status === "en progreso" && task.startedAt) {
    return `Iniciada hace ${formatDistanceToNow(new Date(task.startedAt), {
      locale: es,
    })}`;
  }
  return `Creada hace ${formatDistanceToNow(new Date(task.createdAt), {
    locale: es,
  })}`;
};

export function KanbanCard({ task, isDragging }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task._id,
    data: { task }, // Pasamos la tarea para usarla en el 'overlay'
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  const criticalityVariant: "destructive" | "secondary" | "outline" =
    task.criticality === "alta"
      ? "destructive"
      : task.criticality === "media"
      ? "secondary"
      : "outline";

  const displayName =
    task.assignedTo?.name ||
    task.contractorAssociated?.companyName ||
    "Sin Asignar";
  const displayPhotoUrl =
    task.assignedTo?.photoUrl || task.contractorAssociated?.photoUrl;
  const locationName = task.location?.name || "Sin Ubicación";
  const taskCode = `T-${task._id.slice(-4).toUpperCase()}`;

  const dueDate = new Date(task.dueDate);
  const isOverdue =
    isPast(dueDate) && !isToday(dueDate) && task.status !== "completada";

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        className="h-[210px] bg-card/50 rounded-lg border-2 border-dashed"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="touch-none"
    >
      <Card
        className={cn(
          "hover:shadow-md transition-shadow flex flex-col justify-between min-h-[210px]",
          getUrgencyStyles(task)
        )}
      >
        <div>
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start gap-2">
              <CardTitle className="text-base font-semibold leading-snug">
                <Link href={`/tasks/${task._id}`} className="hover:underline">
                  {task.title}
                </Link>
              </CardTitle>
              <TaskActions task={task} />
            </div>
            <CardDescription className="text-xs pt-1 flex items-center gap-2 flex-wrap">
              <span>{taskCode}</span>
              <Badge variant={criticalityVariant} className="capitalize">
                {task.criticality}
              </Badge>
              {isOverdue && (
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <AlertTriangle className="h-3 w-3" /> Vencida
                </Badge>
              )}
              {task.status === "completada" && (
                <Badge
                  variant="default"
                  className="bg-green-600/80 flex items-center gap-1"
                >
                  <Check className="h-3 w-3" /> Completada
                </Badge>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 text-sm space-y-3">
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 shrink-0" />
              <span className="truncate">{locationName}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <User className="h-4 w-4 mr-2 shrink-0" />
              <span className="truncate">{displayName}</span>
            </div>
          </CardContent>
        </div>

        {/* --- FOOTER RESTAURADO Y MEJORADO --- */}
        <CardFooter className="p-4 pt-2 flex justify-between items-center">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div
              className="flex items-center gap-1"
              title={`${task.comments.length} comentarios`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>{task.comments.length}</span>
            </div>
            <div
              className="flex items-center gap-1"
              title={`${task.attachments.length} adjuntos`}
            >
              <Paperclip className="h-4 w-4" />
              <span>{task.attachments.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium flex items-center justify-end gap-1.5">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>{format(dueDate, "dd MMM, yyyy", { locale: es })}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {getTimeContext(task)}
              </p>
            </div>
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={displayPhotoUrl} alt={displayName} />
              <AvatarFallback>
                {displayName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
