"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ClipboardList, MapPin, Wrench } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/use-tasks";
import { useLocations } from "@/hooks/use-locations";
import { useEquipment } from "@/hooks/use-equipment";
import { Badge } from "@/components/ui/badge";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const { tasks } = useTasks({ search: query });
  const { locations } = useLocations();
  const { equipment } = useEquipment();

  // Filtro local para ubicaciones y equipos (ya están en caché por SWR)
  const filteredLocations = query.length > 1
    ? (locations ?? []).filter(
        (l) =>
          l.name.toLowerCase().includes(query.toLowerCase()) ||
          l.code.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  const filteredEquipment = query.length > 1
    ? (equipment ?? []).filter(
        (e) =>
          e.name.toLowerCase().includes(query.toLowerCase()) ||
          e.code.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  const filteredTasks = query.length > 1 ? (tasks ?? []).slice(0, 5) : [];

  // Atajo de teclado: Ctrl+/ (evita conflictos con atajos del navegador)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "/" && e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navigate = (path: string) => {
    router.push(path);
    setOpen(false);
    setQuery("");
  };

  const STATUS_COLORS: Record<string, string> = {
    pendiente: "bg-yellow-500/10 text-yellow-600",
    "en progreso": "bg-blue-500/10 text-blue-600",
    completada: "bg-green-500/10 text-green-600",
    pausada: "bg-gray-500/10 text-gray-600",
    cancelada: "bg-red-500/10 text-red-600",
  };

  const hasResults =
    filteredTasks.length > 0 ||
    filteredLocations.length > 0 ||
    filteredEquipment.length > 0;

  return (
    <>
      <Button
        variant="outline"
        className="relative h-8 w-full justify-start gap-2 text-sm text-muted-foreground md:w-48 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden md:inline">Buscar...</span>
        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          Ctrl+/
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Buscar tareas, equipos, ubicaciones..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {query.length <= 1 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Escribe para buscar en tareas, equipos y ubicaciones.
            </div>
          )}

          {query.length > 1 && !hasResults && (
            <CommandEmpty>Sin resultados para &quot;{query}&quot;</CommandEmpty>
          )}

          {filteredTasks.length > 0 && (
            <CommandGroup heading="Tareas">
              {filteredTasks.map((task) => (
                <CommandItem
                  key={task._id}
                  value={`tarea-${task._id}-${task.title}`}
                  onSelect={() => navigate(`/tasks/${task._id}`)}
                  className="flex items-center gap-3"
                >
                  <ClipboardList className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate">{task.title}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${
                      STATUS_COLORS[task.status] ?? ""
                    }`}
                  >
                    {task.status}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredTasks.length > 0 && filteredLocations.length > 0 && (
            <CommandSeparator />
          )}

          {filteredLocations.length > 0 && (
            <CommandGroup heading="Ubicaciones">
              {filteredLocations.map((loc) => (
                <CommandItem
                  key={loc._id}
                  value={`ubicacion-${loc._id}-${loc.name}`}
                  onSelect={() => navigate(`/admin/locations`)}
                  className="flex items-center gap-3"
                >
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate">{loc.name}</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {loc.code}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredLocations.length > 0 && filteredEquipment.length > 0 && (
            <CommandSeparator />
          )}

          {filteredEquipment.length > 0 && (
            <CommandGroup heading="Equipos">
              {filteredEquipment.map((eq) => (
                <CommandItem
                  key={eq._id}
                  value={`equipo-${eq._id}-${eq.name}`}
                  onSelect={() => navigate(`/admin/equipment/${eq._id}`)}
                  className="flex items-center gap-3"
                >
                  <Wrench className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate">{eq.name}</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {eq.code}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
