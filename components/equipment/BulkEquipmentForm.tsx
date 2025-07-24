"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { EquipmentTypeEnum } from "@/types";
import { useLocations } from "@/hooks/use-locations";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/handle-error";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
  type: z.nativeEnum(EquipmentTypeEnum, {
    required_error: "El tipo de equipo es requerido.",
  }),
  parentLocationId: z.string({
    required_error: "Debe seleccionar una ubicación padre.",
  }),
  quantity: z.coerce
    .number()
    .int()
    .min(1, "Debe ser al menos 1")
    .max(100, "No se pueden crear más de 100 a la vez."),
  namePrefix: z.string().min(3, "El prefijo del nombre es muy corto."),
  codePrefix: z.string().min(3, "El prefijo del código es muy corto."),
  startNumber: z.coerce.number().int().min(1, "Debe empezar en 1 o más."),
});

type PreviewItem = { name: string; code: string };

export function BulkEquipmentForm() {
  const router = useRouter();
  const { locations } = useLocations();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewItem[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      startNumber: 1,
    },
  });

  const handlePreview = () => {
    const values = form.getValues();
    const parsed = formSchema.safeParse(values);
    if (!parsed.success) {
      form.trigger();
      toast.error("Por favor, corrige los errores en el formulario.");
      return;
    }
    const itemsToPreview: PreviewItem[] = [];
    for (let i = 0; i < values.quantity; i++) {
      const currentNumber = values.startNumber + i;
      const formattedNumber = currentNumber.toString().padStart(2, "0");
      itemsToPreview.push({
        name: `${values.namePrefix} ${formattedNumber}`,
        code: `${values.codePrefix}${formattedNumber}`,
      });
    }
    setPreview(itemsToPreview);
  };

  const handleConfirmCreation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const values = form.getValues();
      const response = await api.post("/equipment/bulk", values);
      toast.success(response.data.message);
      router.push("/admin/equipment");
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
                    <FormLabel>Tipo de Equipo a Crear</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(EquipmentTypeEnum).map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="capitalize"
                          >
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
                name="parentLocationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación Padre</FormLabel>
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
                    <FormDescription>
                      Los nuevos equipos pertenecerán a esta ubicación.
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
                      <Input placeholder="Ej: SCB Inversor 1.1" {...field} />
                    </FormControl>
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
                      <Input placeholder="Ej: SCB-011" {...field} />
                    </FormControl>
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
                          max={100}
                          {...field}
                          onChange={(event) =>
                            field.onChange(+event.target.value)
                          }
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
                Previsualizar Equipos
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
                Se crearán los siguientes {preview.length} equipos. Revisa que
                los nombres y códigos sean correctos.
              </p>
              <div className="max-h-80 overflow-y-auto border rounded-md p-2 space-y-1 text-xs">
                {preview.map((item) => (
                  <p key={item.code} className="font-mono">
                    <strong>{item.code}</strong> - {item.name}
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
                  : `Confirmar y Crear ${preview.length} Equipos`}
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
