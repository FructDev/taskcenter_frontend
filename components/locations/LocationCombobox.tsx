"use client";
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LocationType } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  ps_girasol: "Planta Solar",
  power_station: "Estación de Energía",
  substation: "Subestación",
  block: "Bloque",
  row: "Fila",
  inversor: "Inversor",
  scb: "SCB",
  string: "String",
  weather_station: "Estación Meteorológica",
  building: "Edificio",
  perimeter_fence: "Perímetro / Cerco",
  security_booth: "Garita de Seguridad",
  lighting_pole: "Poste de Iluminación",
  arboretum: "Arboreto",
};

interface LocationComboboxProps {
  locations: LocationType[] | undefined;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Permite seleccionar "ninguna" (útil para campos opcionales) */
  includeNone?: boolean;
  /** Excluir un ID específico de la lista (para evitar ciclos en ubicación padre) */
  excludeId?: string;
}

export function LocationCombobox({
  locations,
  value,
  onChange,
  placeholder = "Selecciona una ubicación...",
  includeNone = false,
  excludeId,
}: LocationComboboxProps) {
  const [open, setOpen] = useState(false);

  const filtered = (locations ?? []).filter((l) => l._id !== excludeId);

  // Agrupar por tipo y ordenar
  const grouped = filtered.reduce<Record<string, LocationType[]>>((acc, loc) => {
    if (!acc[loc.type]) acc[loc.type] = [];
    acc[loc.type].push(loc);
    return acc;
  }, {});

  Object.values(grouped).forEach((g) => g.sort((a, b) => a.name.localeCompare(b.name)));
  const sortedTypes = Object.keys(grouped).sort((a, b) =>
    (TYPE_LABELS[a] ?? a).localeCompare(TYPE_LABELS[b] ?? b)
  );

  const selectedLocation = filtered.find((l) => l._id === value);
  const displayLabel = selectedLocation
    ? `${selectedLocation.name} (${selectedLocation.code})`
    : includeNone && value === "none"
    ? "-- Ninguna --"
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar ubicación..." />
          <CommandList>
            <CommandEmpty>No se encontraron ubicaciones.</CommandEmpty>
            {includeNone && (
              <CommandItem
                value="none"
                onSelect={() => { onChange("none"); setOpen(false); }}
              >
                <Check className={cn("mr-2 h-4 w-4", value === "none" ? "opacity-100" : "opacity-0")} />
                -- Ninguna (raíz) --
              </CommandItem>
            )}
            {sortedTypes.map((type) => (
              <CommandGroup
                key={type}
                heading={TYPE_LABELS[type] ?? type.replace(/_/g, " ")}
              >
                {grouped[type].map((loc) => (
                  <CommandItem
                    key={loc._id}
                    value={`${loc.name} ${loc.code} ${TYPE_LABELS[loc.type] ?? loc.type}`}
                    onSelect={() => { onChange(loc._id); setOpen(false); }}
                  >
                    <Check className={cn("mr-2 h-4 w-4 shrink-0", value === loc._id ? "opacity-100" : "opacity-0")} />
                    <span>{loc.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{loc.code}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
