// src/components/tasks/FailureReportDialog.tsx
"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { FailureModeEnum, FailureReportType } from "@/types";

const formSchema = z.object({
  failureMode: z.nativeEnum(FailureModeEnum, {
    required_error: "El modo de falla es requerido.",
  }),
  diagnosis: z.string().min(10, "El diagnóstico es muy corto."),
  correctiveAction: z.string().min(10, "La acción correctiva es muy corta."),
});

interface FailureReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: FailureReportType) => Promise<void>;
}

export function FailureReportDialog({
  isOpen,
  onOpenChange,
  onConfirm,
}: FailureReportDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onConfirm(values);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reporte de Cierre de Falla</DialogTitle>
          <DialogDescription>
            Antes de completar, por favor detalla la falla y la solución
            aplicada.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="failureMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modo de Falla</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la causa raíz..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(FailureModeEnum).map((mode) => (
                        <SelectItem
                          key={mode}
                          value={mode}
                          className="capitalize"
                        >
                          {mode.replace(/_/g, " ")}
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
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnóstico / Condición Encontrada</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe cómo encontraste el equipo y la causa del problema..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="correctiveAction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acción Correctiva Aplicada</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe la solución que implementaste..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Guardando..."
                  : "Confirmar y Completar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
