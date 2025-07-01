// src/components/tasks/AssigneeSelect.tsx
"use client";

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
import { TaskType, UserType, ContractorType } from "@/types";
import api from "@/lib/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/handle-error";
import { useTasks } from "@/hooks/use-tasks";
import { useTask } from "@/hooks/use-task";

interface AssigneeSelectProps {
  task: TaskType;
}

export function AssigneeSelect({ task }: AssigneeSelectProps) {
  // Obtenemos las listas de usuarios y contratistas
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { contractors, isLoading: isLoadingContractors } = useContractors();

  // Obtenemos la función 'mutate' de los hooks para refrescar los datos
  const { mutate: mutateTaskList } = useTasks();
  const { mutate: mutateSingleTask } = useTask(task._id);

  const técnicos = users?.filter((u) => u.role === "tecnico");

  const currentAssignee =
    task.assignedTo?._id || task.contractorAssociated?._id || "unassigned";
  const currentAssigneeName =
    task.assignedTo?.name || task.contractorAssociated?.companyName || "N/A";

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
      // Refrescamos tanto la lista general como la vista de detalle
      mutateTaskList();
      mutateSingleTask();
    } catch (error) {
      toast.error("Error al actualizar la asignación", {
        description: getErrorMessage(error),
      });
    }
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">Asignado a</span>
      <Select onValueChange={handleValueChange} defaultValue={currentAssignee}>
        <SelectTrigger className="w-[180px] font-semibold">
          <SelectValue placeholder="Sin Asignar">
            {currentAssigneeName}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">-- Sin Asignar --</SelectItem>
          {isLoadingUsers ? (
            <SelectItem value="loading_u" disabled>
              Cargando...
            </SelectItem>
          ) : (
            <SelectGroup>
              <SelectLabel>Técnicos Internos</SelectLabel>
              {técnicos?.map((user: UserType) => (
                <SelectItem key={user._id} value={user._id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
          {isLoadingContractors ? (
            <SelectItem value="loading_c" disabled>
              Cargando...
            </SelectItem>
          ) : (
            <SelectGroup>
              <SelectLabel>Empresas Contratistas</SelectLabel>
              {contractors?.map((c: ContractorType) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.companyName}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
