// src/components/locations/LocationForm.tsx
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { LocationType, LocationTypeEnum } from "@/types";
import { getErrorMessage } from "@/lib/handle-error";
import api from "@/lib/api";
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
  //   SelectGroup,
  SelectItem,
  //   SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useLocations } from "@/hooks/use-locations";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  name: z.string().min(3, "El nombre es muy corto."),
  code: z.string().min(1, "El código es requerido.").toUpperCase(),
  type: z.nativeEnum(LocationTypeEnum, {
    errorMap: () => ({ message: "Debe seleccionar un tipo válido." }),
  }),
  parentLocation: z.string().optional().nullable(),
  description: z.string().optional(),
  // Los campos de coordenadas los dejaremos opcionales y simples por ahora
  coordinates: z
    .object({
      lat: z.coerce.number().optional(), // Debe ser lat
      lng: z.coerce.number().optional(), // Debe ser lng
    })
    .optional(),
});

interface LocationFormProps {
  locationToEdit?: LocationType;
  onSuccess: () => void;
}

export function LocationForm({ locationToEdit, onSuccess }: LocationFormProps) {
  const { locations } = useLocations(); // Para popular el selector de 'padre'
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!locationToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: locationToEdit?.name || "",
      code: locationToEdit?.code || "",
      type: locationToEdit?.type as LocationTypeEnum,
      parentLocation: locationToEdit?.parentLocation?._id || undefined,
      description: locationToEdit?.description || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditMode && locationToEdit) {
        await api.patch(`/locations/${locationToEdit._id}`, values);
        toast.success("Ubicación actualizada.");
      } else {
        await api.post("/locations", values);
        toast.success("Ubicación creada.");
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
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Descriptivo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Inversor 1 de PS-01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código Único</FormLabel>
              <FormControl>
                <Input placeholder="Ej: PS01-INV1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Ubicación</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(LocationTypeEnum).map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="parentLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación Padre (Opcional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ?? ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una ubicación padre..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">-- Ninguna --</SelectItem>
                  {locations
                    ?.filter((loc) => loc._id !== locationToEdit?._id)
                    .map((loc) => (
                      <SelectItem key={loc._id} value={loc._id}>
                        {loc.name} ({loc.code})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Añade detalles adicionales..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormError message={error} />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? isEditMode
              ? "Guardando..."
              : "Creando..."
            : isEditMode
            ? "Guardar Cambios"
            : "Crear Ubicación"}
        </Button>
      </form>
    </Form>
  );
}
