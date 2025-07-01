// src/components/scheduled-tasks/ScheduledTaskForm.tsx
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { ScheduledTaskType, EquipmentTypeEnum } from "@/types";
import { getErrorMessage } from "@/lib/handle-error";
import api from "@/lib/api";
import { useTaskTemplates } from "@/hooks/use-task-templates";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FormError } from "../ui/form-error";

const formSchema = z.object({
  name: z.string().min(3, "El nombre es muy corto."),
  taskTemplate: z.string({ required_error: "Debe seleccionar una plantilla." }),
  schedule: z.string().min(1, "El cron de programación es requerido."),
  targetEquipmentType: z.nativeEnum(EquipmentTypeEnum),
  isEnabled: z.boolean().default(true),
});

interface ScheduledTaskFormProps {
  scheduledTaskToEdit?: ScheduledTaskType;
  onSuccess: () => void;
}

export function ScheduledTaskForm({
  scheduledTaskToEdit,
  onSuccess,
}: ScheduledTaskFormProps) {
  const { templates } = useTaskTemplates();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!scheduledTaskToEdit;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: scheduledTaskToEdit?.name || "",
      taskTemplate: scheduledTaskToEdit?.taskTemplate._id || undefined,
      schedule: scheduledTaskToEdit?.schedule || "0 0 1 * *", // Por defecto: 1ro de cada mes
      targetEquipmentType:
        scheduledTaskToEdit?.targetEquipmentType as EquipmentTypeEnum,
      isEnabled: scheduledTaskToEdit?.isEnabled ?? true,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditMode && scheduledTaskToEdit) {
        await api.patch(`/scheduled-tasks/${scheduledTaskToEdit._id}`, values);
        toast.success("Regla actualizada.");
      } else {
        await api.post("/scheduled-tasks", values);
        toast.success("Regla creada.");
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
              <FormLabel>Nombre de la Regla</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Inspección Mensual de Inversores"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="taskTemplate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plantilla de Tarea a Usar</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una plantilla..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {templates?.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name}
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
          name="targetEquipmentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aplicar a Tipo de Equipo</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo de equipo..." />
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
          control={form.control}
          name="schedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frecuencia (Cron String)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: 0 0 1 * *" {...field} />
              </FormControl>
              <FormDescription>
                Usa formato Cron. &quot;0 0 1 * *&quot; = El 1ro de cada mes a
                medianoche.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Habilitada</FormLabel>
                <FormDescription>
                  Si está deshabilitada, no generará tareas.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormError message={error} />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isEditMode ? "Guardar Cambios" : "Crear Regla"}
        </Button>
      </form>
    </Form>
  );
}
