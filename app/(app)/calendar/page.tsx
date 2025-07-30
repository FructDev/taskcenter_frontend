// app/(app)/calendar/page.tsx
"use client";
import { PageHeader } from "@/components/common/page-header";
import { MaintenanceCalendar } from "@/components/calendar/MaintenanceCalendar";

export default function CalendarPage() {
  return (
    // Usamos flexbox para que el contenido se expanda y ocupe el alto disponible
    <div className="flex flex-col gap-8 h-full">
      <PageHeader
        title="Calendario de Mantenimiento"
        description="Visualiza, planifica y reprograma tareas de forma interactiva."
      />
      {/* El div contenedor ahora es flexible y el calendario crecerá para llenarlo */}
      <div className="flex-1 min-h-0 p-4 bg-card rounded-lg border">
        <MaintenanceCalendar />
      </div>
    </div>
  );
}
