// src/components/activity-log/ActivityLogFilters.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
// import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { useUsers } from "@/hooks/use-users";
import { ActionType } from "@/types";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export function ActivityLogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados locales para controlar los filtros antes de aplicarlos
  const [user, setUser] = useState(searchParams.get("userId") || "");
  const [action, setAction] = useState(searchParams.get("action") || "");
  const [date, setDate] = useState<DateRange | undefined>({
    from: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined,
    to: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined,
  });

  const { users } = useUsers();

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (user) params.set("userId", user);
    if (action) params.set("action", action);
    if (date?.from) params.set("startDate", date.from.toISOString());
    if (date?.to) params.set("endDate", date.to.toISOString());
    router.push(`/activity?${params.toString()}`);
  };

  const handleClear = () => {
    setUser("");
    setAction("");
    setDate(undefined);
    router.push("/activity");
  };

  const hasActiveFilters = !!user || !!action || !!date?.from;

  return (
    // 1. Contenedor principal ahora usa Grid.
    // En móvil (por defecto): 1 columna.
    // En tablet (md): 2 columnas.
    // En escritorio (lg): 4 columnas.
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-center gap-4 p-4 border rounded-lg bg-card">
      {/* Filtro de Usuario */}
      <Select value={user} onValueChange={setUser}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Filtrar por usuario..." />
        </SelectTrigger>
        <SelectContent>
          {users?.map((u) => (
            <SelectItem key={u._id} value={u._id}>
              {u.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro de Acción */}
      <Select value={action} onValueChange={setAction}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Filtrar por acción..." />
        </SelectTrigger>
        <SelectContent>
          {Object.values(ActionType).map((a) => (
            <SelectItem key={a} value={a} className="capitalize">
              {a.replace(/_/g, " ").toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro de Fecha */}
      {/* En pantallas grandes (lg), le decimos que ocupe 2 columnas */}
      <div className="lg:col-span-2 w-full">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Elige un rango de fechas</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Botones de Acción */}
      {/* Le decimos que ocupe todo el ancho en móvil, y se alinee a la derecha en escritorio */}
      <div className="flex gap-2 w-full lg:col-start-4 lg:justify-end">
        <Button onClick={handleFilter} className="w-full sm:w-auto">
          Aplicar Filtros
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
