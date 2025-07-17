// src/components/tasks/AssignTaskModal.tsx
"use client";

import { useState } from "react";
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
import { TaskType, UserType, ContractorType, UserRole } from "@/types";
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
  const { user: currentUser } = useAuth(); // Obtenemos el usuario logueado
  const { users } = useUsers();
  const { contractors } = useContractors();
  const { mutate: mutateSingleTask } = useTask(task._id);
  const { mutate: mutateTaskList } = useTasks();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser) return null; // No mostrar nada si no se ha cargado el usuario

  const técnicos = users?.filter((u) => u.role === "tecnico");
  const supervisoresYPlanificadores = users?.filter(
    (u) => u.role === "supervisor" || u.role === "planificador"
  );

  const handleValueChange = async (value: string) => {
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
      toast.success("Asignación actualizada correctamente.");
      mutateSingleTask(); // Refresca los datos de esta tarea
      mutateTaskList(); // Refresca la lista general de tareas (dashboard)
      setIsOpen(false); // Cierra el modal
    } catch (error) {
      toast.error("Error al actualizar la asignación", {
        description: getErrorMessage(error),
      });
    }
  };

  // Lógica para decidir qué opciones mostrar en el Select
  const canUnassign = [
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
    UserRole.PLANIFICADOR,
  ].includes(currentUser.role as UserRole);
  const canAssignToAnyone = [UserRole.ADMIN, UserRole.SUPERVISOR].includes(
    currentUser.role as UserRole
  );

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
          <Select onValueChange={handleValueChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar un responsable..." />
            </SelectTrigger>
            <SelectContent>
              {canUnassign && (
                <SelectItem value="unassigned">-- Sin Asignar --</SelectItem>
              )}

              {/* Si el rol es Admin o Supervisor, muestra a TODOS los usuarios agrupados */}
              {canAssignToAnyone && users && (
                <>
                  <SelectGroup>
                    <SelectLabel>Técnicos</SelectLabel>
                    {users
                      .filter((u) => u.role === "tecnico")
                      .map((user: UserType) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Gestión y Supervisión</SelectLabel>
                    {users
                      .filter((u) => u.role !== "tecnico")
                      .map((user: UserType) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name} ({user.role})
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </>
              )}

              {/* Si el rol es Planificador, muestra solo a los técnicos */}
              {currentUser.role === UserRole.PLANIFICADOR && técnicos && (
                <SelectGroup>
                  <SelectLabel>Técnicos Internos</SelectLabel>
                  {técnicos.map((user: UserType) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}

              {/* Lógica para Técnico y otros roles (EHS, etc.) */}
              {currentUser.role === UserRole.TECNICO && (
                <SelectItem value={currentUser._id}>
                  {currentUser.name} (Yo)
                </SelectItem>
              )}
              {(currentUser.role === UserRole.EHS ||
                currentUser.role === UserRole.SEGURIDAD_PATRIMONIAL) &&
                supervisoresYPlanificadores && (
                  <SelectGroup>
                    <SelectLabel>Supervisión</SelectLabel>
                    {supervisoresYPlanificadores.map((user: UserType) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}

              {/* Los contratistas son visibles para casi todos los que pueden asignar */}
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
            </SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  );
}
