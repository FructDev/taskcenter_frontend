// src/components/tasks/TaskForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useUsers } from "@/hooks/use-users";
import { useContractors } from "@/hooks/use-contractors";
import { useLocations } from "@/hooks/use-locations";
import api from "@/lib/api";
// import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/handle-error";
import { FormError } from "../ui/form-error";
import { useState } from "react";
import {
  UserType,
  ContractorType,
  LocationType,
  TaskType,
  TaskTypeEnum,
  CriticalityLevel,
} from "@/types";
import { useTasks } from "@/hooks/use-tasks";
import { toast } from "sonner";
import { useTask } from "@/hooks/use-task";
import { useTaskTemplates } from "@/hooks/use-task-templates";
import { useEquipment } from "@/hooks/use-equipment";
import { usePpeItems } from "@/hooks/use-ppe-items";
import { Checkbox } from "../ui/checkbox";

const formSchema = z.object({
  title: z.string().min(5, { message: "El título es muy corto." }),
  description: z.string().min(10, { message: "La descripción es muy corta." }),
  taskType: z.enum(
    [
      "mantenimiento preventivo",
      "mantenimiento correctivo",
      "inspeccion",
      "otro",
    ],
    { required_error: "Debe seleccionar un tipo de tarea." }
  ),
  criticality: z.enum(["baja", "media", "alta"]),
  dueDate: z.date({ required_error: "La fecha de vencimiento es requerida." }),
  location: z.string({ required_error: "La ubicación es requerida." }),
  equipment: z.string().optional().nullable(),
  assignedTo: z.string().optional(),
  contractorAssociated: z.string().optional(),
  contractorContactName: z.string().optional(),
  contractorContactPhone: z.string().optional(),
  requiredPpe: z.array(z.string()).optional(),
});

interface TaskFormProps {
  taskToEdit?: TaskType;
  onSuccess?: () => void;
}

export function TaskForm({ taskToEdit, onSuccess }: TaskFormProps) {
  // const router = useRouter();
  const { mutate: mutateTasks } = useTasks();
  const { mutate: mutateSingleTask } = useTask(taskToEdit?._id);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { templates } = useTaskTemplates();
  const { equipment } = useEquipment();

  const { users } = useUsers();
  const { contractors } = useContractors();
  const { locations } = useLocations();
  const { ppeItems } = usePpeItems();

  const isEditMode = !!taskToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // 3. SI ESTAMOS EN MODO EDICIÓN, USAMOS LOS DATOS DE LA TAREA PARA LOS VALORES POR DEFECTO
    defaultValues: isEditMode
      ? {
          title: taskToEdit.title,
          description: taskToEdit.description,
          taskType: taskToEdit.taskType,
          criticality: taskToEdit.criticality,
          dueDate: new Date(taskToEdit.dueDate),
          location: taskToEdit.location._id,
          equipment: taskToEdit.equipment?._id || undefined,
          assignedTo: taskToEdit.assignedTo?._id,
          contractorAssociated: taskToEdit.contractorAssociated?._id,
          contractorContactName: taskToEdit.contractorContactName,
          requiredPpe: taskToEdit.requiredPpe?.map((item) => item._id) || [],
        }
      : {
          title: "",
          description: "",
          criticality: "baja",
        },
  });

  const handleTemplateChange = (templateId: string) => {
    const template = templates?.find((t) => t._id === templateId);
    if (template) {
      // Usamos form.setValue para cada campo para ser explícitos
      form.setValue("title", template.title, { shouldValidate: true });
      form.setValue("description", template.description || "", {
        shouldValidate: true,
      });
      form.setValue("taskType", template.taskType as TaskTypeEnum);
      form.setValue("criticality", template.criticality as CriticalityLevel);

      if (template.location) {
        form.setValue("location", template.location._id, {
          shouldValidate: true,
        });
      } else {
        form.setValue("location", "");
      }

      if (template.requiredPpe && template.requiredPpe.length > 0) {
        const ppeIds = template.requiredPpe.map((item) => item._id);
        form.setValue("requiredPpe", ppeIds, { shouldValidate: true });
      } else {
        form.setValue("requiredPpe", []);
      }

      toast.success(`Plantilla "${template.name}" cargada.`);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditMode) {
        await api.patch(`/tasks/${taskToEdit._id}`, values);
        toast.success("Tarea actualizada correctamente.");
        mutateSingleTask(); // Refrescamos los datos de esta tarea
      } else {
        await api.post("/tasks", values);
        toast.success("Tarea creada correctamente.");
      }
      mutateTasks(); // Refrescamos la lista general de tareas
      onSuccess?.(); // Ejecutamos el callback de éxito (ej. para cerrar el modal)
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!isEditMode && templates && templates.length > 0 && (
          <FormItem>
            <FormLabel>Cargar desde Plantilla</FormLabel>
            <Select onValueChange={handleTemplateChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una plantilla para empezar..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template._id} value={template._id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Revisión del Inversor SCB-01"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe la tarea a realizar..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col pt-2">
                <FormLabel>Fecha de Vencimiento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Elige una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="pt-2">
                <FormLabel>Ubicación</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una ubicación..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations?.map((location: LocationType) => (
                      <SelectItem key={location._id} value={location._id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="equipment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipo Afectado (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un equipo específico..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">-- Ninguno --</SelectItem>
                  {equipment?.map((eq) => (
                    <SelectItem key={eq._id} value={eq._id}>
                      {eq.name} ({eq.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="taskType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Tarea</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="mantenimiento preventivo">
                      Mantenimiento Preventivo
                    </SelectItem>
                    <SelectItem value="mantenimiento correctivo">
                      Mantenimiento Correctivo
                    </SelectItem>
                    <SelectItem value="inspeccion">Inspección</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="criticality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Criticidad</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la criticidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asignar a Técnico</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un técnico..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users?.map((user: UserType) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Opcional.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contractorAssociated"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asignar a Contratista</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un contratista..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {contractors?.map((c: ContractorType) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Opcional.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="contractorContactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contacto del Contratista</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nombre del responsable en sitio"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Opcional: si la tarea es para un contratista.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contractorContactPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono del Contacto</FormLabel>
              <FormControl>
                <Input
                  placeholder="Teléfono del responsable en sitio"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Opcional: si la tarea es para un contratista.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requiredPpe"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">
                  EPP Requerido (Opcional)
                </FormLabel>
                <FormDescription>
                  Selecciona el equipo de protección personal necesario para
                  esta tarea.
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ppeItems?.map((item) => (
                  <FormField
                    key={item._id}
                    control={form.control}
                    name="requiredPpe"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item._id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([
                                      ...(field.value || []),
                                      item._id,
                                    ])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item._id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.name}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormError message={error} />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading
            ? isEditMode
              ? "Guardando Cambios..."
              : "Creando Tarea..."
            : isEditMode
            ? "Guardar Cambios"
            : "Crear Tarea"}
        </Button>
      </form>
    </Form>
  );
}
