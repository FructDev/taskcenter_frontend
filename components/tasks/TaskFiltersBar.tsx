"use client";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskStatus, CriticalityLevel, TaskTypeEnum } from "@/types";

interface TaskFiltersBarProps {
  status: string;
  criticality: string;
  taskType: string;
  onStatusChange: (v: string) => void;
  onCriticalityChange: (v: string) => void;
  onTaskTypeChange: (v: string) => void;
  onClearAll: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  "en progreso": "En Progreso",
  pausada: "Pausada",
  completada: "Completada",
  cancelada: "Cancelada",
};

const CRITICALITY_LABELS: Record<string, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

const TYPE_LABELS: Record<string, string> = {
  "mantenimiento preventivo": "Preventivo",
  "mantenimiento correctivo": "Correctivo",
  inspeccion: "Inspección",
  otro: "Otro",
};

export function TaskFiltersBar({
  status,
  criticality,
  taskType,
  onStatusChange,
  onCriticalityChange,
  onTaskTypeChange,
  onClearAll,
}: TaskFiltersBarProps) {
  const activeCount = [status, criticality, taskType].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Filtro Estado */}
      <Select value={status || "_all"} onValueChange={(v) => onStatusChange(v === "_all" ? "" : v)}>
        <SelectTrigger className={`h-8 w-auto gap-1 text-sm ${status ? "border-primary text-primary" : ""}`}>
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">Todos los estados</SelectItem>
          {Object.values(TaskStatus).map((s) => (
            <SelectItem key={s} value={s} className="capitalize">
              {STATUS_LABELS[s] ?? s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro Criticidad */}
      <Select value={criticality || "_all"} onValueChange={(v) => onCriticalityChange(v === "_all" ? "" : v)}>
        <SelectTrigger className={`h-8 w-auto gap-1 text-sm ${criticality ? "border-primary text-primary" : ""}`}>
          <SelectValue placeholder="Criticidad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">Toda criticidad</SelectItem>
          {Object.values(CriticalityLevel).map((c) => (
            <SelectItem key={c} value={c} className="capitalize">
              {CRITICALITY_LABELS[c] ?? c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro Tipo */}
      <Select value={taskType || "_all"} onValueChange={(v) => onTaskTypeChange(v === "_all" ? "" : v)}>
        <SelectTrigger className={`h-8 w-auto gap-1 text-sm ${taskType ? "border-primary text-primary" : ""}`}>
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">Todos los tipos</SelectItem>
          {Object.values(TaskTypeEnum).map((t) => (
            <SelectItem key={t} value={t} className="capitalize">
              {TYPE_LABELS[t] ?? t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Chips de filtros activos + botón limpiar */}
      {activeCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {status && (
            <Badge variant="secondary" className="gap-1 pr-1">
              {STATUS_LABELS[status] ?? status}
              <button onClick={() => onStatusChange("")} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {criticality && (
            <Badge variant="secondary" className="gap-1 pr-1">
              {CRITICALITY_LABELS[criticality] ?? criticality}
              <button onClick={() => onCriticalityChange("")} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {taskType && (
            <Badge variant="secondary" className="gap-1 pr-1">
              {TYPE_LABELS[taskType] ?? taskType}
              <button onClick={() => onTaskTypeChange("")} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={onClearAll}>
            Limpiar todo
          </Button>
        </div>
      )}
    </div>
  );
}
