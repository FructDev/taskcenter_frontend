// app/(app)/tasks/new/page.tsx
import { TaskForm } from "@/components/tasks/TaskForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewTaskPage() {
  return (
    // Usamos una Card para mantener un estilo consistente con el login
    <Card>
      <CardHeader>
        <CardTitle>Crear Nueva Tarea</CardTitle>
        <CardDescription>
          Complete los detalles a continuación para registrar una nueva tarea.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TaskForm />
      </CardContent>
    </Card>
  );
}
