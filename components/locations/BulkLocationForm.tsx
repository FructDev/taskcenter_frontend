"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { LocationTypeEnum } from "@/types";
import { useLocations } from "@/hooks/use-locations";
import { LocationCombobox } from "./LocationCombobox";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/handle-error";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormError } from "../ui/form-error";

const formSchema = z.object({
  type: z.nativeEnum(LocationTypeEnum, {
    required_error: "El tipo de ubicación es requerido.",
  }),
  parentLocationId: z.string().optional(),
  quantity: z.coerce
    .number()
    .int()
    .min(1, "Debe ser al menos 1")
    .max(200, "No se pueden crear más de 200 a la vez."),
  namePrefix: z.string().min(2, "El prefijo del nombre es muy corto."),
  codePrefix: z.string().min(2, "El prefijo del código es muy corto."),
  startNumber: z.coerce.number().int().min(1, "Debe empezar en 1 o más."),
});

type PreviewItem = { name: string; code: string };

export function BulkLocationForm() {
  const router = useRouter();
  const { locations } = useLocations();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewItem[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { quantity: 1, startNumber: 1 },
  });

  const handlePreview = () => {
    const values = form.getValues();
    const parsed = formSchema.safeParse(values);
    if (!parsed.success) {
      form.trigger();
      toast.error("Por favor, corrige los errores en el formulario.");
      return;
    }
    const items: PreviewItem[] = [];
    for (let i = 0; i < values.quantity; i++) {
      const n = (values.startNumber + i).toString().padStart(2, "0");
      items.push({
        name: `${values.namePrefix} ${n}`,
        code: `${values.codePrefix}${n}`.toUpperCase(),
      });
    }
    setPreview(items);
  };

  const handleConfirmCreation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const values = form.getValues();
      const response = await api.post("/locations/bulk", values);
      toast.success(response.data.message);
      router.push("/admin/locations");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>1. Definir Parámetros</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Ubicación</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(LocationTypeEnum).map((t) => (
                          <SelectItem key={t} value={t} className="capitalize">
                            {t.replace(/_/g, " ")}
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
                name="parentLocationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación Padre (Opcional)</FormLabel>
                    <FormControl>
                      <LocationCombobox
                        locations={locations}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="Sin ubicación padre..."
                        includeNone
                      />
                    </FormControl>
                    <FormDescription>
                      Las nuevas ubicaciones quedarán anidadas bajo esta.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="namePrefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prefijo del Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Bloque" {...field} />
                    </FormControl>
                    <FormDescription>
                      Se generará: &quot;Bloque 01&quot;, &quot;Bloque 02&quot;…
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codePrefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prefijo del Código</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: BLQ-" {...field} />
                    </FormControl>
                    <FormDescription>
                      Se generará: &quot;BLQ-01&quot;, &quot;BLQ-02&quot;…
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={200}
                          {...field}
                          onChange={(e) => field.onChange(+e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº Inicial</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="button" onClick={handlePreview} className="w-full">
                Previsualizar Ubicaciones
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="sticky top-20">
        <CardHeader>
          <CardTitle>2. Previsualización y Confirmación</CardTitle>
        </CardHeader>
        <CardContent>
          {preview.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Se crearán las siguientes {preview.length} ubicaciones. Revisa
                que los nombres y códigos sean correctos.
              </p>
              <div className="max-h-80 overflow-y-auto border rounded-md p-2 space-y-1 text-xs">
                {preview.map((item) => (
                  <p key={item.code} className="font-mono">
                    <strong>{item.code}</strong> — {item.name}
                  </p>
                ))}
              </div>
              <FormError message={error} />
              <Button
                onClick={handleConfirmCreation}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading
                  ? "Creando..."
                  : `Confirmar y Crear ${preview.length} Ubicaciones`}
              </Button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-16">
              Completa los parámetros y haz clic en &quot;Previsualizar&quot;
              para ver los resultados aquí.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
