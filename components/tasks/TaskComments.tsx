// src/components/tasks/TaskComments.tsx
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

import { TaskType } from "@/types";
import { useTask } from "@/hooks/use-task";
import { useAuth } from "@/hooks/use-auth"; // <-- 1. Importamos el hook de autenticación
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/handle-error";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Separator } from "../ui/separator";

const commentSchema = z.object({
  text: z
    .string()
    .min(1, "El comentario no puede estar vacío.")
    .max(500, "El comentario es demasiado largo."),
});

export function TaskComments({ task }: { task: TaskType }) {
  const { mutate } = useTask(task._id);
  const { user: currentUser } = useAuth(); // <-- 2. Obtenemos al usuario logueado

  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: { text: "" },
  });

  async function onSubmit(values: z.infer<typeof commentSchema>) {
    try {
      await api.post(`/tasks/${task._id}/comments`, values);
      toast.success("Comentario añadido.");
      form.reset();
      mutate();
    } catch (error) {
      toast.error("No se pudo añadir el comentario", {
        description: getErrorMessage(error),
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Formulario para añadir un nuevo comentario */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex items-start gap-4"
        >
          {/* 3. Usamos los datos del usuario logueado para el avatar */}
          <Avatar className="h-9 w-9 hidden sm:flex border">
            <AvatarImage src={currentUser?.photoUrl} alt={currentUser?.name} />
            <AvatarFallback>
              {currentUser?.name.substring(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="grid w-full gap-2">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe una actualización o comentario..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="self-end"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Enviando..."
                : "Añadir Comentario"}
            </Button>
          </div>
        </form>
      </Form>

      <Separator />

      {/* Lista de comentarios existentes */}
      <div className="space-y-4">
        {task.comments.length === 0 && (
          <p className="text-sm text-center text-muted-foreground py-4">
            Aún no hay comentarios.
          </p>
        )}
        {task.comments
          .slice()
          .reverse()
          .map((comment) => (
            <div key={comment._id} className="flex items-start gap-4">
              {/* 4. Usamos los datos del autor del comentario que vienen de la API */}
              <Avatar className="h-9 w-9 border">
                <AvatarImage
                  src={comment.author?.photoUrl}
                  alt={comment.author?.name}
                />
                <AvatarFallback>
                  {comment.author?.name?.substring(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1.5 w-full">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-sm">
                    {comment.author?.name || "Usuario desconocido"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      locale: es,
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  <p className="whitespace-pre-wrap">{comment.text}</p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
