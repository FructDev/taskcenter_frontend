// src/components/ppe-items/PpeItemForm.tsx
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { PpeItemType } from "@/types";
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
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  name: z.string().min(3, "El nombre es muy corto."),
  description: z.string().optional(),
});

interface PpeItemFormProps {
  ppeItemToEdit?: PpeItemType;
  onSuccess: () => void;
}

export function PpeItemForm({ ppeItemToEdit, onSuccess }: PpeItemFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!ppeItemToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ppeItemToEdit?.name || "",
      description: ppeItemToEdit?.description || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditMode && ppeItemToEdit) {
        await api.patch(`/ppe-items/${ppeItemToEdit._id}`, values);
        toast.success("EPP actualizado.");
      } else {
        await api.post("/ppe-items", values);
        toast.success("EPP creado.");
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
              <FormLabel>Nombre del EPP</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Casco de seguridad con barbiquejo"
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
              <FormLabel>Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalles sobre el uso o especificación..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormError message={error} />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isEditMode ? "Guardar Cambios" : "Crear EPP"}
        </Button>
      </form>
    </Form>
  );
}
