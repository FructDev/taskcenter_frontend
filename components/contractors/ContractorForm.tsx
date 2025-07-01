// src/components/contractors/ContractorForm.tsx
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { ContractorType } from "@/types";
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

// --- SCHEMA CORREGIDO ---
const formSchema = z.object({
  companyName: z
    .string()
    .min(3, { message: "El nombre de la empresa es muy corto." }),
  contactInfo: z
    .string()
    .min(5, { message: "La información de contacto es muy corta." }),
  specialty: z.string().min(3, { message: "La especialidad es muy corta." }),
  phone: z.string().min(1, { message: "El teléfono es requerido." }),

  // Usamos z.preprocess para que el campo sea verdaderamente opcional
  photo: z.any().optional(),
});

interface ContractorFormProps {
  contractorToEdit?: ContractorType;
  onSuccess: () => void;
}

export function ContractorForm({
  contractorToEdit,
  onSuccess,
}: ContractorFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!contractorToEdit;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: contractorToEdit?.companyName || "",
      contactInfo: contractorToEdit?.contactInfo || "",
      specialty: contractorToEdit?.specialty || "",
      phone: contractorToEdit?.phone || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    const { photo, ...contractorData } = values;
    const photoFile = photo?.[0];

    try {
      let savedContractor = contractorToEdit;

      // Paso 1: Guardar/Actualizar los datos de texto
      if (isEditMode && contractorToEdit) {
        const response = await api.patch(
          `/contractors/${contractorToEdit._id}`,
          contractorData
        );
        savedContractor = response.data;
        toast.success("Contratista actualizado.");
      } else {
        const response = await api.post("/contractors", contractorData);
        savedContractor = response.data;
        toast.success("Contratista creado.");
      }

      // Paso 2: Si hay una foto, subirla
      if (photoFile && savedContractor) {
        const formData = new FormData();
        formData.append("file", photoFile);

        toast.info("Subiendo logo...", { id: "photo-upload" });
        await api.post(`/contractors/${savedContractor._id}/photo`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Logo actualizado.", { id: "photo-upload" });
      }

      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
      toast.dismiss("photo-upload");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Empresa</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Inversores del Sol S.A." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Información de Contacto</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: contacto@inversoressol.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="specialty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especialidad</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Mantenimiento de Paneles" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input placeholder="Ej: 809-555-1234" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo de la Empresa (Opcional)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/jpeg, image/png"
                  onChange={(e) => field.onChange(e.target.files)}
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
            : "Crear Contratista"}
        </Button>
      </form>
    </Form>
  );
}
