// src/components/reports/TasksByStatusPieChart.tsx
"use client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useReport } from "@/hooks/use-report";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";

interface StatusReportData {
  status: string;
  count: number;
}

const COLORS: { [key: string]: string } = {
  pendiente: "#f59e0b", // amber-500
  "en progreso": "#3b82f6", // blue-500
  completada: "#22c55e", // green-500
  cancelada: "#64748b", // slate-500
};

export function TasksByStatusPieChart() {
  const { data, isLoading, isError } =
    useReport<StatusReportData[]>("tasks-by-status");

  if (isLoading) return <Skeleton className="h-[350px] w-full" />;
  if (isError || !data)
    return (
      <Card className="h-[350px] flex items-center justify-center">
        <p className="text-destructive">No se pudo cargar el informe.</p>
      </Card>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tareas por Estado</CardTitle>
        <CardDescription>
          Distribución actual de todas las tareas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 250 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60} // <-- Esto lo convierte en un gráfico de dona
                outerRadius={90}
                paddingAngle={5}
                dataKey="count"
                nameKey="status"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.status] || "#cccccc"}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Tareas"]} />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
