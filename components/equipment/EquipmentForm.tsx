// src/components/equipment/EquipmentForm.tsx
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { EquipmentType, EquipmentTypeEnum } from "@/types";
import { getErrorMessage } from "@/lib/handle-error";
import api from "@/lib/api";
import { useLocations } from "@/hooks/use-locations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "../ui/form-error";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { es } from "date-fns/locale";

const formSchema = z.object({
  name: z.string().min(3, "El nombre es muy corto."),
  code: z.string().min(1, "El código es requerido.").toUpperCase(),
  type: z.nativeEnum(EquipmentTypeEnum),
  location: z.string({ required_error: "La ubicación es requerida." }),
  brand: z.string().optional(),
  model: z.string().optional(),
  installationDate: z.date().optional(),
});

interface EquipmentFormProps {
  equipmentToEdit?: EquipmentType;
  onSuccess: () => void;
}

export function EquipmentForm({
  equipmentToEdit,
  onSuccess,
}: EquipmentFormProps) {
  const { locations } = useLocations();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!equipmentToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: equipmentToEdit?.name || "",
      code: equipmentToEdit?.code || "",
      type: equipmentToEdit?.type,
      location: equipmentToEdit?.location._id,
      brand: equipmentToEdit?.brand || "",
      model: equipmentToEdit?.model || "",
      installationDate: equipmentToEdit?.installationDate
        ? new Date(equipmentToEdit.installationDate)
        : undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditMode && equipmentToEdit) {
        await api.patch(`/equipment/${equipmentToEdit._id}`, values);
        toast.success("Equipo actualizado.");
      } else {
        await api.post("/equipment", values);
        toast.success("Equipo creado.");
      }
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Equipo</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Inversor Central Zona Norte"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="code"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código Único</FormLabel>
              <FormControl>
                <Input placeholder="Ej: INV-ZN-01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="type"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Equipo</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(EquipmentTypeEnum).map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="location"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación Física</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una ubicación..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locations?.map((loc) => (
                    <SelectItem key={loc._id} value={loc._id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="brand"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca (Opcional)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="model"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo (Opcional)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          name="installationDate"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Instalación (Opcional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: es })
                      ) : (
                        <span>Elige una fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormError message={error} />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isEditMode ? "Guardar Cambios" : "Crear Equipo"}
        </Button>
      </form>
    </Form>
  );
}
