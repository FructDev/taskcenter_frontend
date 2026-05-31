// src/components/tasks/DailyLogSection.tsx
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Camera, ImagePlus, X } from "lucide-react";

import { TaskType } from "@/types";
import { useLocations } from "@/hooks/use-locations";
import { LocationCombobox } from "@/components/locations/LocationCombobox";
import { useTask } from "@/hooks/use-task";
import api from "@/lib/api";
import { getErrorMessage, isOfflineQueued } from "@/lib/handle-error";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormError } from "../ui/form-error";

const logSchema = z.object({
  locationId: z.string({ required_error: "La ubicación es requerida." }),
  notes: z.string().optional(),
});

export function DailyLogSection({ task }: { task: TaskType }) {
  const { locations } = useLocations();
  const { mutate } = useTask(task._id);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const todayString = new Date().toISOString().split("T")[0];
  const hasLogForToday = task.dailyLogs.some(
    (log) => new Date(log.createdAt).toISOString().split("T")[0] === todayString
  );

  const form = useForm<z.infer<typeof logSchema>>({
    resolver: zodResolver(logSchema),
    defaultValues: { locationId: task.location._id, notes: "" },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (values: z.infer<typeof logSchema>) => {
    setIsUploading(true);
    setError(null);
    try {
      let photoUrl: string | undefined;

      // Subir foto a Cloudinary si existe
      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        const uploadRes = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        photoUrl = uploadRes.data.url;
      }

      await api.post(`/tasks/${task._id}/daily-log`, {
        ...values,
        ...(photoUrl && { photoUrl }),
      });

      toast.success("Registro diario guardado con éxito.");
      form.reset({ locationId: task.location._id, notes: "" });
      removePhoto();
      mutate();
    } catch (err) {
      if (isOfflineQueued(err)) {
        toast.info("Sin conexión", {
          description: "El registro se enviará automáticamente cuando vuelva internet.",
        });
        form.reset({ locationId: task.location._id, notes: "" });
        removePhoto();
        mutate();
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bitácora de Trabajo Diario</CardTitle>
      </CardHeader>
      <CardContent>
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
                    <FormControl>
                      <LocationCombobox
                        locations={locations}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="Selecciona ubicación..."
                      />
                    </FormControl>
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

              {/* Foto del trabajo */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Foto Evidencia (Opcional)</p>
                {photoPreview ? (
                  <div className="relative w-full max-w-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoPreview}
                      alt="Vista previa"
                      className="rounded-md border object-cover w-full max-h-48"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute top-1 right-1 bg-destructive text-white rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-sm text-muted-foreground border border-dashed rounded-md px-4 py-3 hover:bg-muted/50 transition-colors w-full"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Tomar o seleccionar foto</span>
                    <ImagePlus className="h-4 w-4 ml-auto" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              <FormError message={error} />
              <Button type="submit" disabled={form.formState.isSubmitting || isUploading}>
                {isUploading
                  ? "Subiendo foto..."
                  : form.formState.isSubmitting
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

        {/* Historial de registros */}
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
              <div key={log._id} className="text-sm border-b pb-3 space-y-1">
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
                  <p className="text-muted-foreground pl-2 border-l-2">
                    &quot;{log.notes}&quot;
                  </p>
                )}
                {log.photoUrl && (
                  <a
                    href={log.photoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={log.photoUrl}
                      alt="Foto del registro"
                      className="rounded-md border object-cover max-h-48 hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  </a>
                )}
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
