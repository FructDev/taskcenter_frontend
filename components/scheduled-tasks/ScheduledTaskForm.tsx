"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useState, useEffect } from "react";
// import { useSearchParams } from "next/navigation";
import { EquipmentTypeEnum, ScheduledTaskType } from "@/types";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "../ui/separator";
import { parseCronExpression } from "@/lib/cron-parser"; // Crearemos este helper

const formSchema = z.object({
  name: z.string().min(3, "El nombre es muy corto."),
  taskTemplate: z.string({ required_error: "Debe seleccionar una plantilla." }),
  targetEquipmentType: z.nativeEnum(EquipmentTypeEnum),
  schedule: z
    .string()
    .min(9, "Debe configurar una frecuencia válida.")
    .max(100),
  isEnabled: z.boolean().default(true),
});

interface ScheduledTaskFormProps {
  scheduledTaskToEdit?: ScheduledTaskType;
  onSuccess: () => void;
  defaultDate?: string;
}

type FrequencyType = "daily" | "weekly" | "monthly";
const daysOfWeek = [
  { id: "MON", label: "L" },
  { id: "TUE", label: "M" },
  { id: "WED", label: "X" },
  { id: "THU", label: "J" },
  { id: "FRI", label: "V" },
  { id: "SAT", label: "S" },
  { id: "SUN", label: "D" },
];

export function ScheduledTaskForm({
  scheduledTaskToEdit,
  onSuccess,
  defaultDate,
}: ScheduledTaskFormProps) {
  const { templates } = useTaskTemplates();
  // const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!scheduledTaskToEdit;
  const [isLoading, setIsLoading] = useState(false);
  console.log(isLoading);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: scheduledTaskToEdit?.name || "",
      taskTemplate: scheduledTaskToEdit?.taskTemplate._id || undefined,
      targetEquipmentType: scheduledTaskToEdit?.targetEquipmentType,
      schedule: scheduledTaskToEdit?.schedule || "",
      isEnabled: scheduledTaskToEdit?.isEnabled ?? true,
    },
  });

  // Estados para controlar la UI del generador de cron
  const [frequency, setFrequency] = useState<FrequencyType>("weekly");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [time, setTime] = useState("07:00");

  // Efecto que GENERA el cron string automáticamente
  useEffect(() => {
    const [hour, minute] = time.split(":");
    let cronString = "";
    if (frequency === "daily") {
      cronString = `${minute} ${hour} * * *`;
    } else if (frequency === "weekly" && selectedDays.length > 0) {
      cronString = `${minute} ${hour} * * ${selectedDays.join(",")}`;
    } else if (frequency === "monthly") {
      cronString = `${minute} ${hour} ${dayOfMonth} * *`;
    }
    form.setValue("schedule", cronString, { shouldValidate: true });
  }, [frequency, selectedDays, dayOfMonth, time, form]);

  // Efecto que PARSEA un cron string existente (para el modo edición) o desde la URL
  useEffect(() => {
    const cronOrDate = defaultDate || scheduledTaskToEdit?.schedule;
    if (cronOrDate) {
      const parsed = parseCronExpression(cronOrDate);
      setFrequency(parsed.frequency);
      setSelectedDays(parsed.daysOfWeek);
      setDayOfMonth(parsed.dayOfMonth);
      setTime(parsed.time);
    }
  }, [scheduledTaskToEdit, defaultDate]);

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      {type.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                La tarea se creará para todos los equipos de este tipo.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />
        <FormLabel className="text-base font-semibold block">
          Configuración de Frecuencia
        </FormLabel>

        <RadioGroup
          onValueChange={(v: string) => setFrequency(v as FrequencyType)}
          value={frequency}
          className="flex flex-col sm:flex-row gap-4 pt-2"
        >
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <RadioGroupItem value="daily" />
            </FormControl>
            <FormLabel className="font-normal">Diariamente</FormLabel>
          </FormItem>
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <RadioGroupItem value="weekly" />
            </FormControl>
            <FormLabel className="font-normal">Semanalmente</FormLabel>
          </FormItem>
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <RadioGroupItem value="monthly" />
            </FormControl>
            <FormLabel className="font-normal">Mensualmente</FormLabel>
          </FormItem>
        </RadioGroup>

        {frequency === "weekly" && (
          <FormItem>
            <FormLabel>Días de la Semana</FormLabel>
            <ToggleGroup
              type="multiple"
              value={selectedDays}
              onValueChange={setSelectedDays}
              variant="outline"
              className="flex-wrap justify-start"
            >
              {daysOfWeek.map((day) => (
                <ToggleGroupItem key={day.id} value={day.id}>
                  {day.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </FormItem>
        )}

        {frequency === "monthly" && (
          <FormItem>
            <FormLabel>Día del Mes</FormLabel>
            <Input
              type="number"
              min={1}
              max={28}
              value={dayOfMonth}
              onChange={(e) =>
                setDayOfMonth(
                  Math.min(28, Math.max(1, parseInt(e.target.value) || 1))
                )
              }
              className="w-28"
            />
            <FormDescription>
              Se creará el día {dayOfMonth} de cada mes. (Máx 28 para evitar
              errores en Febrero).
            </FormDescription>
          </FormItem>
        )}

        <FormItem>
          <FormLabel>Hora de Creación</FormLabel>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-40"
          />
        </FormItem>

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
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {isEditMode ? "Guardar Cambios" : "Crear Regla"}
        </Button>
      </form>
    </Form>
  );
}
