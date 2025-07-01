// src/components/tasks/StatusChangeDialog.tsx
"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Label } from "../ui/label";

interface StatusChangeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => Promise<void>;
  title: string;
  description: string;
}

export function StatusChangeDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  title,
  description,
}: StatusChangeDialogProps) {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reseteamos el texto cuando el diálogo se cierra
  useEffect(() => {
    if (!isOpen) {
      setReason("");
    }
  }, [isOpen]);

  const canSubmit = reason.length >= 10;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsLoading(true);
    await onSubmit(reason);
    setIsLoading(false);
    onOpenChange(false); // Cierra el diálogo después de enviar
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="reason" className="text-sm font-medium">
            Justificación (requerido)
          </Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe el motivo del cambio de estado..."
          />
          <p className="text-xs text-muted-foreground">Mínimo 10 caracteres.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isLoading}>
            {isLoading ? "Confirmando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
