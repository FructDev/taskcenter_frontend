// src/components/tasks/TaskPpeRequirements.tsx
"use client";
import { TaskType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { getPpeIcon } from "@/lib/icon-map";

export function TaskPpeRequirements({ task }: { task: TaskType }) {
  const hasPpe = task.requiredPpe && task.requiredPpe.length > 0;
  // La tarea se considera 'verificada' si ya no está pendiente
  const isVerified = task.status !== "pendiente";

  if (!hasPpe) {
    return null; // No renderizar nada si no hay EPPs requeridos
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">EPP Requerido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {task.requiredPpe?.map((ppe) => {
          const Icon = getPpeIcon(ppe.name);
          return (
            <div key={ppe._id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{ppe.name}</span>
              </div>
              {isVerified && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirmado</span>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
