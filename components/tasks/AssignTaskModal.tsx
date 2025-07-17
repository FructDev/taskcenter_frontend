// src/components/tasks/AssignTaskModal.tsx
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers } from "@/hooks/use-users";
import { useContractors } from "@/hooks/use-contractors";
import { useWorkloadReport } from "@/hooks/use-workload-report"; // <-- 1. Importamos el nuevo hook
import { TaskType, ContractorType, UserRole } from "@/types";
import api from "@/lib/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/handle-error";
import { useTask } from "@/hooks/use-task";
import { useTasks } from "@/hooks/use-tasks";
import { useAuth } from "@/hooks/use-auth";
import { Edit } from "lucide-react";

interface AssignTaskModalProps {
  task: TaskType;
}

export function AssignTaskModal({ task }: AssignTaskModalProps) {
  const { user: currentUser } = useAuth();
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { contractors, isLoading: isLoadingContractors } = useContractors();
  const { workload, isLoading: isLoadingWorkload } = useWorkloadReport(); // <-- 2. Obtenemos los datos de carga
  const { mutate: mutateSingleTask } = useTask(task._id);
  const { mutate: mutateTaskList } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3. Usamos useMemo para crear una lista de usuarios "enriquecida" con su carga de trabajo
  const usersWithWorkload = useMemo(() => {
    if (!users) return []; // Si no hay usuarios, devolvemos un array vacío
    // Si la carga de trabajo aún no ha llegado, mostramos los usuarios sin el dato extra
    if (!workload) return users.map((u) => ({ ...u, workloadLabel: "" }));

    return users.map((user) => {
      const userWorkload = workload.find((w) => w.userId === user._id);
      const activeTasks = userWorkload?.activeTasks || 0;
      return {
        ...user,
        workloadLabel: `(${activeTasks} activas)`,
      };
    });
  }, [users, workload]);

  const handleValueChange = async (value: string) => {
    setIsSubmitting(true);
    let payload = {};
    const isUser = users?.some((u) => u._id === value);

    if (value === "unassigned") {
      payload = { assignedTo: null, contractorAssociated: null };
    } else if (isUser) {
      payload = { assignedTo: value, contractorAssociated: null };
    } else {
      payload = { contractorAssociated: value, assignedTo: null };
    }

    try {
      await api.patch(`/tasks/${task._id}`, payload);
      toast.success("Asignación actualizada.");
      mutateSingleTask();
      mutateTaskList();
      setIsOpen(false);
    } catch (error) {
      toast.error("Error al actualizar la asignación", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) return null;

  // Lógica de permisos (sin cambios)
  const canUnassign = [
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
    UserRole.PLANIFICADOR,
  ].includes(currentUser.role as UserRole);
  const canAssignToAnyone = [UserRole.ADMIN, UserRole.SUPERVISOR].includes(
    currentUser.role as UserRole
  );

  const isLoadingData =
    isLoadingUsers || isLoadingContractors || isLoadingWorkload;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Cambiar Asignación
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar Responsable</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Select onValueChange={handleValueChange} disabled={isSubmitting}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar un responsable..." />
            </SelectTrigger>
            <SelectContent>
              {isLoadingData ? (
                <SelectItem value="loading" disabled>
                  Cargando...
                </SelectItem>
              ) : (
                <>
                  {canUnassign && (
                    <SelectItem value="unassigned">
                      -- Sin Asignar --
                    </SelectItem>
                  )}

                  {/* 4. Usamos la nueva lista 'usersWithWorkload' en todas partes */}
                  <SelectGroup>
                    <SelectLabel>Técnicos</SelectLabel>
                    {usersWithWorkload
                      .filter((u) => u.role === "tecnico")
                      .map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          <div className="flex justify-between w-full">
                            <span>{user.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {user.workloadLabel}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectGroup>

                  {canAssignToAnyone && (
                    <SelectGroup>
                      <SelectLabel>Gestión y Supervisión</SelectLabel>
                      {usersWithWorkload
                        .filter((u) => u.role !== "tecnico")
                        .map((user) => (
                          <SelectItem key={user._id} value={user._id}>
                            <div className="flex justify-between w-full">
                              <span>
                                {user.name} ({user.role})
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {user.workloadLabel}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  )}

                  {contractors && (
                    <SelectGroup>
                      <SelectLabel>Empresas Contratistas</SelectLabel>
                      {contractors.map((c: ContractorType) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.companyName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  );
}
