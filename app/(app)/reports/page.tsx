"use client";

import { useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { PageHeader } from "@/components/common/page-header";
import { useReportDashboard } from "@/hooks/use-report-dashboard";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Importaremos estos componentes a medida que los creemos
import { KpiCards } from "@/components/reports/KpiCards";
import { TasksByStatusPieChart } from "@/components/reports/TasksByStatusPieChart";
import { TasksByCriticalityBarChart } from "@/components/reports/TasksByCriticalityBarChart";
import { TasksByTypeBarChart } from "@/components/reports/TasksByTypeBarChart";
import { TopTechniciansTable } from "@/components/reports/TopTechniciansTable";
import { TopFailingEquipmentTable } from "@/components/reports/TopFailingEquipmentTable";
import { TasksTrendLineChart } from "@/components/reports/TasksTrendLineChart";

// Componente interno para poder usar los hooks de URL
function ReportsDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Convertimos los parámetros de la URL a un objeto de filtros
  const filters = useMemo(
    () => Object.fromEntries(searchParams.entries()),
    [searchParams]
  );

  const { data, isLoading } = useReportDashboard(filters);

  const handleFilterChange = (newFilter: Record<string, string> | null) => {
    // Si el gráfico nos envía 'null', significa que queremos limpiar todos los filtros
    if (newFilter === null) {
      router.push("/reports");
      return;
    }

    const currentParams = new URLSearchParams(searchParams);
    const filterKey = Object.keys(newFilter)[0];
    const filterValue = newFilter[filterKey];

    // Lógica de "toggle": si hacemos clic en un filtro ya activo, lo quitamos.
    if (currentParams.get(filterKey) === filterValue) {
      currentParams.delete(filterKey);
    } else {
      currentParams.set(filterKey, filterValue);
    }
    router.push(`/reports?${currentParams.toString()}`);
  };

  const clearFilters = () => {
    router.push("/reports");
  };

  const hasFilters = searchParams.toString().length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Botón para limpiar filtros */}
      {hasFilters && (
        <div className="flex justify-end">
          <Button variant="ghost" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" /> Limpiar Filtros
          </Button>
        </div>
      )}

      {/* Fila 1: KPIs Principales */}
      <KpiCards kpiData={data?.kpis} isLoading={isLoading} />

      {/* Fila 2: Análisis del Trabajo Actual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {isLoading ? (
            <Skeleton className="h-[350px]" />
          ) : (
            <TasksByStatusPieChart
              data={data?.tasksByStatus || []}
              filters={filters} // Le pasamos los filtros para que sepa cuál está activo
              onFilterChange={handleFilterChange} // Le pasamos la función para que pueda avisar
            />
          )}
        </div>
        <div className="lg:col-span-1">
          {isLoading ? (
            <Skeleton className="h-[350px]" />
          ) : (
            <TasksByCriticalityBarChart
              data={data?.tasksByCriticality || []}
              onFilterChange={handleFilterChange}
            />
          )}
        </div>
        <div className="lg:col-span-1">
          {isLoading ? (
            <Skeleton className="h-[350px]" />
          ) : (
            <TasksByTypeBarChart
              data={data?.tasksByType || []}
              onFilterChange={handleFilterChange}
            />
          )}
        </div>
      </div>

      {/* Fila 3: Análisis de Rendimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopTechniciansTable
          data={data?.topTechnicians}
          isLoading={isLoading}
          onFilterChange={handleFilterChange}
        />
        <TopFailingEquipmentTable
          data={data?.topFailingEquipment}
          isLoading={isLoading}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Fila 4: Análisis de Tendencias */}
      <TasksTrendLineChart data={data?.tasksTrend} isLoading={isLoading} />
    </div>
  );
}

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Dashboard de Inteligencia de Negocio"
        description="Analiza el rendimiento operativo. Haz clic en los gráficos para filtrar todos los datos."
      />
      {/* Suspense es necesario porque usamos useSearchParams */}
      <Suspense fallback={<div>Cargando dashboard...</div>}>
        <ReportsDashboard />
      </Suspense>
    </>
  );
}
