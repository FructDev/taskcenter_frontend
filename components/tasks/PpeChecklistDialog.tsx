// src/components/tasks/PpeChecklistDialog.tsx
"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PpeItemType } from "@/types";
import { ShieldCheck } from "lucide-react";

interface PpeChecklistDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  requiredPpe: PpeItemType[];
  onConfirm: () => Promise<void>; // Función a llamar si el checklist es exitoso
}

export function PpeChecklistDialog({
  isOpen,
  onOpenChange,
  requiredPpe,
  onConfirm,
}: PpeChecklistDialogProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Resetea los items marcados cada vez que se abre el modal
    if (isOpen) {
      setCheckedItems(new Set());
    }
  }, [isOpen]);

  const handleCheckChange = (itemId: string, isChecked: boolean) => {
    const newCheckedItems = new Set(checkedItems);
    if (isChecked) {
      newCheckedItems.add(itemId);
    } else {
      newCheckedItems.delete(itemId);
    }
    setCheckedItems(newCheckedItems);
  };

  const allItemsChecked = requiredPpe.length === checkedItems.size;

  const handleConfirm = async () => {
    if (!allItemsChecked) return;
    setIsLoading(true);
    await onConfirm(); // Llama a la función que realmente inicia la tarea
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Verificación de Seguridad Pre-Tarea
          </DialogTitle>
          <DialogDescription>
            Confirma que tienes y estás usando todo el Equipo de Protección
            Personal (EPP) requerido para esta tarea.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <h4 className="font-semibold">EPP Requerido:</h4>
          <div className="space-y-2 rounded-md border p-4">
            {requiredPpe.map((item) => (
              <div key={item._id} className="flex items-center space-x-2">
                <Checkbox
                  id={item._id}
                  onCheckedChange={(checked) =>
                    handleCheckChange(item._id, checked as boolean)
                  }
                  checked={checkedItems.has(item._id)}
                />
                <Label htmlFor={item._id} className="font-medium">
                  {item.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!allItemsChecked || isLoading}
          >
            {isLoading ? "Iniciando..." : "Confirmar e Iniciar Tarea"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
