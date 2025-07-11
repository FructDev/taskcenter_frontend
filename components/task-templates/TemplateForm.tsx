// src/components/task-templates/TemplateForm.tsx
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { TaskTemplateType } from "@/types";
import { getErrorMessage } from "@/lib/handle-error";
import api from "@/lib/api";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Textarea } from "../ui/textarea";
import { useLocations } from "@/hooks/use-locations";
import { usePpeItems } from "@/hooks/use-ppe-items";
import { Checkbox } from "../ui/checkbox";

// Usamos los enums que ya tenemos en los tipos de Tarea
const TaskTypeEnum = z.enum([
  "mantenimiento preventivo",
  "mantenimiento correctivo",
  "inspeccion",
  "otro",
]);
const CriticalityLevelEnum = z.enum(["baja", "media", "alta"]);

const formSchema = z.object({
  name: z.string().min(3, "El nombre de la plantilla es muy corto."),
  title: z.string().min(5, "El título predefinido es muy corto."),
  description: z.string().optional(),
  taskType: TaskTypeEnum,
  criticality: CriticalityLevelEnum,
  location: z.string().optional().nullable(),
  requiredPpe: z.array(z.string()).optional(),
});

interface TemplateFormProps {
  templateToEdit?: TaskTemplateType;
  onSuccess: () => void;
}

export function TemplateForm({ templateToEdit, onSuccess }: TemplateFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!templateToEdit;
  const { locations } = useLocations();
  const { ppeItems } = usePpeItems();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: templateToEdit?.name || "",
      title: templateToEdit?.title || "",
      description: templateToEdit?.description || "",
      taskType: templateToEdit?.taskType,
      criticality: templateToEdit?.criticality || "baja",
      location: templateToEdit?.location?._id || undefined,
      requiredPpe: templateToEdit?.requiredPpe?.map((item) => item._id) || [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditMode && templateToEdit) {
        await api.patch(`/task-templates/${templateToEdit._id}`, values);
        toast.success("Plantilla actualizada.");
      } else {
        await api.post("/task-templates", values);
        toast.success("Plantilla creada.");
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
              <FormLabel>Nombre de la Plantilla</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Inspección Mensual Inversor"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título Predefinido de la Tarea</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Inspección Mensual de Inversor"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción Predefinida</FormLabel>
              <FormControl>
                <Textarea placeholder="Procedimiento estándar..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="requiredPpe"
          render={({}) => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">EPP Requerido</FormLabel>
                <FormDescription>
                  Selecciona el equipo de protección personal necesario para
                  esta tarea.
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ppeItems?.map((item) => (
                  <FormField
                    key={item._id}
                    control={form.control}
                    name="requiredPpe"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item._id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([
                                      ...(field.value || []),
                                      item._id,
                                    ])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item._id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.name}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="taskType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Tarea</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="mantenimiento preventivo">
                      M. Preventivo
                    </SelectItem>
                    <SelectItem value="mantenimiento correctivo">
                      M. Correctivo
                    </SelectItem>
                    <SelectItem value="inspeccion">Inspección</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="criticality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Criticidad</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación Preestablecida (Opcional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una ubicación..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">-- Ninguna --</SelectItem>
                    {locations?.map((loc) => (
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
        </div>
        <FormError message={error} />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? isEditMode
              ? "Guardando..."
              : "Creando..."
            : isEditMode
            ? "Guardar Cambios"
            : "Crear Plantilla"}
        </Button>
      </form>
    </Form>
  );
}
