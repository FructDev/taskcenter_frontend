// src/components/tasks/DailyLogSection.tsx
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { TaskType } from "@/types";
import { useLocations } from "@/hooks/use-locations";
import { useTask } from "@/hooks/use-task";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/handle-error";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormError } from "../ui/form-error";
// import { Separator } from "../ui/separator";

const logSchema = z.object({
  locationId: z.string({ required_error: "La ubicación es requerida." }),
  notes: z.string().optional(),
});

export function DailyLogSection({ task }: { task: TaskType }) {
  const { locations } = useLocations();
  const { mutate } = useTask(task._id);
  const [error, setError] = useState<string | null>(null);

  const todayString = new Date().toISOString().split("T")[0];
  const hasLogForToday = task.dailyLogs.some(
    (log) => new Date(log.createdAt).toISOString().split("T")[0] === todayString
  );

  const form = useForm<z.infer<typeof logSchema>>({
    resolver: zodResolver(logSchema),
    defaultValues: { locationId: task.location._id, notes: "" },
  });

  const onSubmit = async (values: z.infer<typeof logSchema>) => {
    try {
      await api.post(`/tasks/${task._id}/daily-log`, values);
      toast.success("Registro diario guardado con éxito.");
      mutate(); // Refresca los datos de la tarea para mostrar el nuevo log
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bitácora de Trabajo Diario</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Formulario para el check-in de hoy */}
        {!hasLogForToday && task.status === "en progreso" ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-4 border rounded-lg space-y-4 mb-6"
            >
              <h3 className="font-semibold">Añadir Registro para Hoy</h3>
              <FormField
                control={form.control}
                name="locationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación de Hoy</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona ubicación..." />
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
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Añade notas sobre el trabajo de hoy..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormError message={error} />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Guardando..."
                  : "Guardar Registro"}
              </Button>
            </form>
          </Form>
        ) : (
          task.status === "en progreso" && (
            <p className="text-sm text-green-600 font-semibold mb-6">
              ✅ El registro de hoy ya ha sido completado.
            </p>
          )
        )}

        {/* Historial de check-ins anteriores */}
        <div className="space-y-4">
          <h4 className="font-semibold">Registros Anteriores</h4>
          {task.dailyLogs.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay registros diarios.
            </p>
          )}
          {task.dailyLogs
            .slice()
            .reverse()
            .map((log) => (
              <div key={log._id} className="text-sm border-b pb-2">
                <p>
                  <span className="font-semibold">Fecha:</span>{" "}
                  {format(
                    new Date(log.createdAt),
                    "dd 'de' MMMM, yyyy 'a las' HH:mm",
                    { locale: es }
                  )}
                </p>
                <p>
                  <span className="font-semibold">Ubicación:</span>{" "}
                  {log.location.name}
                </p>
                <p>
                  <span className="font-semibold">Confirmado por:</span>{" "}
                  {log.confirmedBy.name}
                </p>
                {log.notes && (
                  <p className="text-muted-foreground mt-1 pl-2 border-l-2">
                    &quot;{log.notes}&quot;
                  </p>
                )}
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
