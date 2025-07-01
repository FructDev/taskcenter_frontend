// src/components/users/UserForm.tsx
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";

import { UserType, UserRole } from "@/types";
import { getErrorMessage } from "@/lib/handle-error";
import api from "@/lib/api";

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
import { FormError } from "../ui/form-error";

// Zod schema para la validación del formulario
const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  email: z.string().email({ message: "El formato del email no es válido." }),
  phone: z.string().min(1, { message: "El teléfono es requerido." }),
  department: z.string().min(1, { message: "El departamento es requerido." }),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: "Debe seleccionar un rol válido." }),
  }),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres." })
    .optional()
    .or(z.literal("")),
  photoUrl: z
    .string()
    .url({ message: "Debe ser una URL válida." })
    .optional()
    .or(z.literal("")),
});

interface UserFormProps {
  userToEdit?: UserType;
  onSuccess: () => void; // onSuccess ahora es requerido
}

export function UserForm({ userToEdit, onSuccess }: UserFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!userToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: userToEdit?.name || "",
      email: userToEdit?.email || "",
      phone: userToEdit?.phone || "",
      department: userToEdit?.department || "",
      role: (userToEdit?.role as UserRole) || UserRole.TECNICO,
      password: "",
      photoUrl: userToEdit?.photoUrl || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    const dataToSend = { ...values };
    if (isEditMode && !dataToSend.password) {
      delete dataToSend.password;
    }
    // Si photoUrl está vacío, lo enviamos como 'null' para que se pueda borrar en la BD si es necesario
    if (dataToSend.photoUrl === "") {
      dataToSend.photoUrl = null as never;
    }

    try {
      if (isEditMode && userToEdit) {
        await api.patch(`/users/${userToEdit._id}`, dataToSend);
        toast.success("Usuario actualizado correctamente.");
      } else {
        await api.post("/users", dataToSend);
        toast.success("Usuario creado correctamente.");
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
        {/* --- INICIO DEL CÓDIGO JSX DEL FORMULARIO COMPLETO --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Juan Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departamento</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Operaciones" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(UserRole).map((role) => (
                    <SelectItem key={role} value={role} className="capitalize">
                      {role.replace(/_/g, " ")}
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              {isEditMode && (
                <FormDescription>
                  Dejar en blanco para no cambiar la contraseña actual.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de la Foto (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/photo.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* --- FIN DEL CÓDIGO JSX DEL FORMULARIO --- */}

        <FormError message={error} />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? isEditMode
              ? "Guardando..."
              : "Creando..."
            : isEditMode
            ? "Guardar Cambios"
            : "Crear Usuario"}
        </Button>
      </form>
    </Form>
  );
}
