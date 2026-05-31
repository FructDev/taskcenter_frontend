"use client";
import { Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { useReportDashboard } from "@/hooks/use-report-dashboard";
import { Button } from "@/components/ui/button";
import { X, FileSpreadsheet, FileDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCards } from "@/components/reports/KpiCards";
import { TasksByStatusPieChart } from "@/components/reports/TasksByStatusPieChart";
import { TasksByCriticalityBarChart } from "@/components/reports/TasksByCriticalityBarChart";
import { TasksByTypeBarChart } from "@/components/reports/TasksByTypeBarChart";
import { TopTechniciansTable } from "@/components/reports/TopTechniciansTable";
import { TopFailingEquipmentTable } from "@/components/reports/TopFailingEquipmentTable";
import { TasksTrendLineChart } from "@/components/reports/TasksTrendLineChart";
import { exportToExcel, exportToPdf } from "@/lib/export-reports";

function ReportsDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filters = useMemo(
    () => Object.fromEntries(searchParams.entries()),
    [searchParams]
  );
  const { data, isLoading } = useReportDashboard(filters);
  const hasFilters = searchParams.toString().length > 0;

  const handleFilterChange = (newFilter: Record<string, string> | null) => {
    if (newFilter === null) {
      router.push("/reports");
      return;
    }
    const currentParams = new URLSearchParams(searchParams);
    const filterKey = Object.keys(newFilter)[0];
    const filterValue = newFilter[filterKey];
    if (currentParams.get(filterKey) === filterValue) {
      currentParams.delete(filterKey);
    } else {
      currentParams.set(filterKey, filterValue);
    }
    router.push(`/reports?${currentParams.toString()}`);
  };

  const exportButtons = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        disabled={isLoading || !data}
        onClick={() => data && exportToExcel(data)}
      >
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Exportar Excel
      </Button>
      <Button
        variant="outline"
        disabled={isLoading || !data}
        onClick={() => data && exportToPdf(data)}
      >
        <FileDown className="mr-2 h-4 w-4" />
        Exportar PDF
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader
        title="Dashboard de Inteligencia de Negocio"
        description="Analiza el rendimiento operativo. Haz clic en los gráficos para filtrar todos los datos."
        actionButton={exportButtons}
      />

      {hasFilters && (
        <div className="flex justify-end">
          <Button variant="ghost" onClick={() => handleFilterChange(null)}>
            <X className="mr-2 h-4 w-4" /> Limpiar Filtros
          </Button>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <KpiCards kpiData={data?.kpis} isLoading={isLoading} />
        </div>

        <div className="col-span-12 lg:col-span-4">
          {isLoading ? (
            <Skeleton className="h-[350px]" />
          ) : (
            <TasksByStatusPieChart
              data={data?.tasksByStatus || []}
              onFilterChange={handleFilterChange}
              filters={filters}
            />
          )}
        </div>
        <div className="col-span-12 lg:col-span-4">
          {isLoading ? (
            <Skeleton className="h-[350px]" />
          ) : (
            <TasksByCriticalityBarChart
              data={data?.tasksByCriticality || []}
              onFilterChange={handleFilterChange}
              filters={filters}
            />
          )}
        </div>
        <div className="col-span-12 lg:col-span-4">
          {isLoading ? (
            <Skeleton className="h-[350px]" />
          ) : (
            <TasksByTypeBarChart
              data={data?.tasksByType || []}
              onFilterChange={handleFilterChange}
              filters={filters}
            />
          )}
        </div>

        <div className="col-span-12 lg:col-span-7">
          {isLoading ? (
            <Skeleton className="h-[400px]" />
          ) : (
            <TopTechniciansTable
              data={data?.topTechnicians}
              isLoading={isLoading}
              onFilterChange={handleFilterChange}
            />
          )}
        </div>
        <div className="col-span-12 lg:col-span-5">
          {isLoading ? (
            <Skeleton className="h-[400px]" />
          ) : (
            <TopFailingEquipmentTable
              data={data?.topFailingEquipment}
              isLoading={isLoading}
              onFilterChange={handleFilterChange}
            />
          )}
        </div>

        <div className="col-span-12">
          {isLoading ? (
            <Skeleton className="h-[400px]" />
          ) : (
            <TasksTrendLineChart
              data={data?.tasksTrend}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center">Cargando dashboard...</div>}
    >
      <ReportsDashboard />
    </Suspense>
  );
}
