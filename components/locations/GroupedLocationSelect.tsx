"use client";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import { LocationType } from "@/types";

// Etiquetas legibles para cada tipo de ubicación
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

interface GroupedLocationSelectProps {
  locations: LocationType[] | undefined;
  /** Muestra una opción "Ninguna" al inicio (útil para campos opcionales) */
  includeNone?: boolean;
  noneLabel?: string;
}

export function GroupedLocationSelect({
  locations,
  includeNone = false,
  noneLabel = "-- Ninguna --",
}: GroupedLocationSelectProps) {
  if (!locations || locations.length === 0) {
    return (
      <SelectContent>
        <SelectItem value="_empty" disabled>
          No hay ubicaciones disponibles
        </SelectItem>
      </SelectContent>
    );
  }

  // Agrupar por tipo manteniendo el orden de aparición
  const grouped = locations.reduce<Record<string, LocationType[]>>(
    (acc, loc) => {
      const key = loc.type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(loc);
      return acc;
    },
    {}
  );

  // Ordenar las ubicaciones dentro de cada grupo por nombre
  Object.values(grouped).forEach((group) =>
    group.sort((a, b) => a.name.localeCompare(b.name))
  );

  // Ordenar los grupos por su etiqueta legible
  const sortedTypes = Object.keys(grouped).sort((a, b) =>
    (TYPE_LABELS[a] ?? a).localeCompare(TYPE_LABELS[b] ?? b)
  );

  return (
    <SelectContent>
      {includeNone && (
        <SelectItem value="none">{noneLabel}</SelectItem>
      )}
      {sortedTypes.map((type) => (
        <SelectGroup key={type}>
          <SelectLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-2 py-1">
            {TYPE_LABELS[type] ?? type.replace(/_/g, " ")}
          </SelectLabel>
          {grouped[type].map((loc) => (
            <SelectItem key={loc._id} value={loc._id}>
              <span>{loc.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {loc.code}
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      ))}
    </SelectContent>
  );
}
