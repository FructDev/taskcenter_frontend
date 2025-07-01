// app/(app)/reports/page.tsx
"use client";
import { PageHeader } from "@/components/common/page-header";
import { AverageResolutionTimeCard } from "@/components/reports/AverageResolutionTimeCard";
import { AvgTimeByGroupChart } from "@/components/reports/AvgTimeByGroupChart";
import { TasksByCriticalityBarChart } from "@/components/reports/TasksByCriticalityBarChart";
import { TasksByStatusPieChart } from "@/components/reports/TasksByStatusPieChart";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Centro de Informes"
        description="Análisis y estadísticas sobre el rendimiento y las operaciones del parque."
      />

      {/* Usamos una rejilla responsiva para organizar las tarjetas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* El gráfico de pastel ocupa una columna */}
        <div className="lg:col-span-1">
          <TasksByStatusPieChart />
        </div>

        {/* El gráfico de barras ocupa dos columnas */}
        <div className="lg:col-span-2">
          <TasksByCriticalityBarChart />
        </div>
      </div>
      <div>
        <AvgTimeByGroupChart
          reportName="avg-time-by-type"
          title="Tiempo de Resolución por Tipo de Tarea"
          description="Promedio de horas para completar tareas según su naturaleza."
        />
      </div>
      <div className="lg:col-span-2">
        <AvgTimeByGroupChart
          reportName="avg-time-by-criticality"
          title="Tiempo de Resolución por Criticidad"
          description="Promedio de horas para completar tareas según su urgencia."
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Aquí podríamos añadir el gráfico por tipo de tarea */}
        <div className="lg:col-span-1">
          <AverageResolutionTimeCard />
        </div>
      </div>
    </div>
  );
}
