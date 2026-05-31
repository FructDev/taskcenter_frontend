"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "@/hooks/use-tasks";
import { useParkMapStore } from "@/store/park-map.store";
import { TaskStatus, TaskType } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isPast, isToday } from "date-fns";
import { es } from "date-fns/locale";
import {
  ExternalLink,
  MapPin,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  Activity,
  ListFilter,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constantes ───────────────────────────────────────────────────────────────

const PARK_CENTER: [number, number] = [18.2833, -70.1167];

const STATUS_COLOR: Record<string, string> = {
  pendiente: "#f59e0b",
  "en progreso": "#3b82f6",
  pausada: "#64748b",
};
const STATUS_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  "en progreso": "En Progreso",
  pausada: "Pausada",
};

// ─── Marcadores ───────────────────────────────────────────────────────────────

function buildMarkerHtml(task: TaskType): string {
  const color = STATUS_COLOR[task.status] ?? "#a1a1aa";
  const name = task.assignedTo?.name ?? task.contractorAssociated?.companyName ?? "?";
  const photo = task.assignedTo?.photoUrl ?? task.contractorAssociated?.photoUrl;
  const initials = name.substring(0, 2).toUpperCase();
  const dueDate = new Date(task.dueDate);
  const overdue = isPast(dueDate) && !isToday(dueDate);
  const borderColor = overdue ? "#ef4444" : color;

  const img = photo
    ? `<img src="${photo}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:3px solid ${borderColor};display:block;"/>`
    : `<div style="width:40px;height:40px;border-radius:50%;background:${borderColor}22;border:3px solid ${borderColor};display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:${borderColor};">${initials}</div>`;

  return `
    <div style="position:relative;text-align:center;cursor:pointer;filter:drop-shadow(0 2px 6px rgba(0,0,0,.35));">
      ${img}
      ${overdue ? `<div style="position:absolute;top:-4px;right:-4px;background:#ef4444;border-radius:50%;width:14px;height:14px;display:flex;align-items:center;justify-content:center;font-size:9px;color:white;font-weight:bold;border:2px solid white;">!</div>` : ""}
      <div style="margin-top:3px;background:${borderColor};color:white;font-size:9px;font-weight:700;padding:2px 6px;border-radius:999px;white-space:nowrap;max-width:80px;overflow:hidden;text-overflow:ellipsis;box-shadow:0 1px 4px rgba(0,0,0,.3);">
        ${name.split(" ")[0]}
      </div>
    </div>`;
}

// ─── Tarjeta de tarea en el panel ─────────────────────────────────────────────

function TaskCard({
  task,
  isSelected,
  onClick,
}: {
  task: TaskType;
  isSelected: boolean;
  onClick: () => void;
}) {
  const name = task.assignedTo?.name ?? task.contractorAssociated?.companyName ?? "Sin asignar";
  const photo = task.assignedTo?.photoUrl ?? task.contractorAssociated?.photoUrl;
  const dueDate = new Date(task.dueDate);
  const overdue = isPast(dueDate) && !isToday(dueDate) && task.status !== "completada";
  const color = STATUS_COLOR[task.status] ?? "#a1a1aa";
  const hasCoords = !!task.location?.coordinates?.lat;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-3 rounded-lg transition-all border",
        isSelected
          ? "bg-primary/10 border-primary shadow-sm"
          : "border-transparent hover:bg-muted/60",
        !hasCoords && "opacity-50"
      )}
    >
      <div className="flex items-start gap-2.5">
        <Avatar className="h-8 w-8 shrink-0 mt-0.5 border-2" style={{ borderColor: color }}>
          <AvatarImage src={photo} alt={name} />
          <AvatarFallback className="text-xs font-bold" style={{ color }}>
            {name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-sm font-medium leading-tight truncate">{task.title}</p>
          <p className="text-xs text-muted-foreground truncate">{name}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: color }}
            >
              {STATUS_LABEL[task.status]}
            </span>
            {overdue && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-destructive">
                <AlertTriangle className="h-2.5 w-2.5" /> Vencida
              </span>
            )}
            {!hasCoords && (
              <span className="text-[10px] text-muted-foreground">Sin ubicar</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function OperationalMap() {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Map<string, any>>(new Map());

  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  const { imageUrl, imageWidth, imageHeight } = useParkMapStore();
  const { tasks, isLoading, mutate } = useTasks({
    status: [TaskStatus.PENDIENTE, TaskStatus.EN_PROGRESO, TaskStatus.PAUSADA],
    refreshInterval: 60000,
  });

  const allTasks = tasks ?? [];
  const tasksWithCoords = allTasks.filter(
    (t) => t.location?.coordinates?.lat != null
  );

  // Estadísticas
  const pending = allTasks.filter((t) => t.status === "pendiente").length;
  const inProgress = allTasks.filter((t) => t.status === "en progreso").length;
  const overdue = allTasks.filter((t) => {
    const d = new Date(t.dueDate);
    return (
      isPast(d) &&
      !isToday(d) &&
      t.status !== "completada" &&
      t.status !== "cancelada"
    );
  }).length;

  // ── Inicializar mapa ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const markersToClean = markersRef.current;

    import("leaflet").then((L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      let map: ReturnType<typeof L.map>;

      if (imageUrl && imageWidth && imageHeight) {
        const bounds: [[number, number], [number, number]] = [
          [0, 0],
          [imageHeight, imageWidth],
        ];
        map = L.map(mapRef.current!, {
          crs: L.CRS.Simple,
          minZoom: -5,
          maxZoom: 4,
          zoomControl: false,
          attributionControl: false,
          maxBounds: bounds,
          maxBoundsViscosity: 1.0,
        });
        L.imageOverlay(imageUrl, bounds).addTo(map);
        (mapRef.current! as HTMLElement).style.background = "#111";

        // Zoom tipo "cover": la imagen llena todo el contenedor sin bordes grises
        const fitCover = () => {
          map.invalidateSize();
          const container = map.getSize(); // {x: ancho, y: alto} en px
          const scaleX = container.x / imageWidth;
          const scaleY = container.y / imageHeight;
          // cover = el mayor de los dos factores (la imagen desborda en una dimensión)
          const coverScale = Math.max(scaleX, scaleY);
          const coverZoom = Math.log2(coverScale);
          map.setView([imageHeight / 2, imageWidth / 2], coverZoom, {
            animate: false,
          });
        };

        setTimeout(fitCover, 100);
      } else {
        map = L.map(mapRef.current!, {
          center: PARK_CENTER,
          zoom: 15,
          zoomControl: false,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 20,
        }).addTo(map);
      }

      L.control.zoom({ position: "bottomright" }).addTo(map);

      map.on("click", () => setSelectedTask(null));
      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersToClean.clear();
      }
    };
  }, [imageUrl, imageWidth, imageHeight]);

  // ── Recalcular tamaño cuando el panel se abre/cierra ───────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const timer = setTimeout(() => {
      mapInstanceRef.current.invalidateSize();
    }, 320); // esperar la animación del panel (300ms)
    return () => clearTimeout(timer);
  }, [panelOpen]);

  // ── Actualizar marcadores ───────────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || isLoading) return;
    // Capturamos la referencia en una variable local para el cleanup
    const markersMap = markersRef.current;
    const mapInstance = mapInstanceRef.current;

    import("leaflet").then((L) => {
      // Eliminar marcadores que ya no existen
      markersMap.forEach((marker, id) => {
        if (!tasksWithCoords.find((t) => t._id === id)) {
          marker.remove();
          markersMap.delete(id);
        }
      });

      // Crear o actualizar marcadores
      tasksWithCoords.forEach((task) => {
        const { lat, lng } = task.location.coordinates!;
        const existing = markersMap.get(task._id);

        const icon = L.divIcon({
          html: buildMarkerHtml(task),
          className: "",
          iconSize: [48, 58],
          iconAnchor: [24, 58],
        });

        if (existing) {
          existing.setLatLng([lat, lng]);
          existing.setIcon(icon);
        } else {
          const marker = L.marker([lat, lng], { icon }).addTo(mapInstance);
          marker.on("click", () => {
            setSelectedTask((prev) => (prev?._id === task._id ? null : task));
          });
          markersMap.set(task._id, marker);
        }
      });
    });
  }, [tasksWithCoords, isLoading]);

  // ── Centrar mapa en tarea seleccionada ──────────────────────────────────────
  const focusTask = (task: TaskType) => {
    setSelectedTask(task);
    if (!task.location?.coordinates || !mapInstanceRef.current) return;
    const { lat, lng } = task.location.coordinates;
    mapInstanceRef.current.flyTo([lat, lng], imageUrl ? 1 : 18, { duration: 0.8 });
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-muted/30">

      {/* ── Panel lateral ────────────────────────────────────────────────── */}
      <div
        className={cn(
          "relative flex flex-col bg-background border-r shadow-sm transition-all duration-300 z-10",
          panelOpen ? "w-72 min-w-[288px]" : "w-0 min-w-0 overflow-hidden border-r-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Cabecera del panel */}
          <div className="px-4 pt-5 pb-3 border-b">
            <h2 className="font-bold text-base">Mapa Operativo</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Parque Solar Girasol — Yaguate
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-2 p-3 border-b">
            <div className="flex flex-col items-center gap-0.5 p-2 rounded-lg bg-yellow-500/10">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-lg font-bold text-yellow-600">{pending}</span>
              <span className="text-[10px] text-muted-foreground leading-tight text-center">Pendientes</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 p-2 rounded-lg bg-blue-500/10">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-lg font-bold text-blue-600">{inProgress}</span>
              <span className="text-[10px] text-muted-foreground leading-tight text-center">En progreso</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 p-2 rounded-lg bg-red-500/10">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-lg font-bold text-red-600">{overdue}</span>
              <span className="text-[10px] text-muted-foreground leading-tight text-center">Vencidas</span>
            </div>
          </div>

          {/* Lista de tareas */}
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <ListFilter className="h-3.5 w-3.5" />
              Tareas activas ({allTasks.length})
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => mutate()}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-2 p-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))
            ) : allTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm px-3">
                No hay tareas activas en este momento.
              </div>
            ) : tasksWithCoords.length === 0 ? (
              <div className="mx-2 mt-2 mb-1 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 space-y-1">
                <p className="font-semibold">⚠ Ninguna ubicación tiene coordenadas</p>
                <p>Ve a <strong>Admin → Ubicaciones</strong>, edita cada una y haz clic en el plano para ubicarla.</p>
              </div>
            ) : null}
            {allTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                isSelected={selectedTask?._id === task._id}
                onClick={() => {
                  if (task.location?.coordinates) {
                    focusTask(task);
                  } else {
                    setSelectedTask(task);
                  }
                }}
              />
            ))}
          </div>

          {/* Detalle de tarea seleccionada */}
          {selectedTask && (
            <div className="border-t p-3 bg-muted/30 space-y-3">
              <div className="space-y-1">
                <p className="font-semibold text-sm leading-tight">{selectedTask.title}</p>
                <p className="text-xs text-muted-foreground">{selectedTask.location?.name}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: STATUS_COLOR[selectedTask.status] ?? "#a1a1aa" }}
                >
                  {STATUS_LABEL[selectedTask.status] ?? selectedTask.status}
                </span>
                <span className="text-[10px] text-muted-foreground capitalize">
                  {selectedTask.criticality}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Vence:{" "}
                {format(new Date(selectedTask.dueDate), "dd MMM yyyy", { locale: es })}
              </p>
              <Button
                size="sm"
                className="w-full h-8 text-xs"
                onClick={() => router.push(`/tasks/${selectedTask._id}`)}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Abrir tarea
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Botón toggle del panel */}
      <button
        onClick={() => setPanelOpen((v) => !v)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-background border shadow-md rounded-r-lg px-1 py-3 hover:bg-muted transition-colors"
        style={{ left: panelOpen ? 288 : 0 }}
      >
        {panelOpen ? (
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* ── Mapa ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="absolute inset-0" />

        {/* Badge con modo activo */}
        <div className="absolute top-3 right-3 z-[500] flex items-center gap-1.5 bg-background/90 backdrop-blur-sm border rounded-full px-3 py-1.5 text-xs font-medium shadow-sm">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          {imageUrl ? "Plano del parque" : "OpenStreetMap"}
        </div>

        {/* Aviso sin tareas en el mapa */}
        {!isLoading && tasksWithCoords.length === 0 && allTasks.length > 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[500] bg-background/95 backdrop-blur-sm border rounded-xl px-4 py-3 text-center shadow-lg text-sm max-w-xs">
            <MapPin className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground" />
            <p className="font-medium">Ninguna tarea tiene coordenadas</p>
            <p className="text-xs text-muted-foreground mt-1">
              Edita las ubicaciones en <strong>Admin → Ubicaciones</strong> para ubicarlas en el mapa.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
