// src/components/tasks/LogFindingForm.tsx
"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { EquipmentCombobox } from "../equipment/EquipmentCombobox";

const formSchema = z.object({
  equipmentId: z.string().min(1, "Debes seleccionar un equipo."),
  description: z.string().min(5, "La descripción es muy corta."),
});

interface LogFindingFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
}

export function LogFindingForm({ onSubmit }: LogFindingFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="equipmentId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Equipo Afectado</FormLabel>
              <EquipmentCombobox
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción del Hallazgo</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe el problema encontrado..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? "Registrando..."
            : "Registrar Hallazgo"}
        </Button>
      </form>
    </Form>
  );
}
