// src/components/tasks/TaskAttachments.tsx
"use client";
import { ChangeEvent, useRef } from "react";
import { TaskType } from "@/types";
import { Button } from "../ui/button";
import { Paperclip, Upload } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/handle-error";
import { useTask } from "@/hooks/use-task";

export function TaskAttachments({ task }: { task: TaskType }) {
  const { mutate } = useTask(task._id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      toast.info("Subiendo archivo...", { id: "upload-toast" });
      await api.post(`/tasks/${task._id}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Archivo subido correctamente.", { id: "upload-toast" });
      mutate();
    } catch (error) {
      toast.error("Error al subir el archivo", {
        id: "upload-toast",
        description: getErrorMessage(error),
      });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button onClick={handleUploadClick} variant="outline" size="sm">
        <Upload className="h-4 w-4 mr-2" />
        Añadir Adjunto
      </Button>
      <div className="mt-4 space-y-2">
        {task.attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay archivos adjuntos.
          </p>
        ) : (
          task.attachments.map((url, index) => (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              key={index}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Paperclip className="h-4 w-4" />
              <span>{url.split("/").pop()}</span>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
