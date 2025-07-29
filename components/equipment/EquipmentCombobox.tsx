// src/components/equipment/EquipmentCombobox.tsx
"use client";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePaginatedEquipment } from "@/hooks/use-paginated-equipment";
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

interface EquipmentComboboxProps {
  value?: string | null;
  onChange: (value: string) => void;
}

export function EquipmentCombobox({ value, onChange }: EquipmentComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);

  const { equipment, isLoading } = usePaginatedEquipment({
    page: 1,
    limit: 20,
    search: debouncedSearch,
    type: "",
  });

  const selectedEquipmentName =
    equipment.find((eq) => eq._id === value)?.name || "Selecciona un equipo...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{selectedEquipmentName}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        {/* 1. Deshabilitamos el filtro interno del componente */}
        <Command filter={() => 1}>
          {/* 2. Corregimos el typo a onValueChange */}
          <CommandInput
            placeholder="Buscar por nombre o código..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Buscando..." : "No se encontró ningún equipo."}
            </CommandEmpty>
            <CommandGroup>
              {equipment.map((eq) => (
                <CommandItem
                  key={eq._id}
                  value={eq.name}
                  onSelect={() => {
                    onChange(eq._id === value ? "" : eq._id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === eq._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{eq.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {eq.code}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
