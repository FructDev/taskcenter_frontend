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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartData {
  status: string;
  count: number;
}

interface ChartProps {
  data: ChartData[];
  filters: Record<string, string>; // <-- 1. Recibe el objeto de filtros completo
  onFilterChange: (filter: { status: string } | null) => void; // <-- 2. Acepta null para limpiar
}

const COLORS: { [key: string]: string } = {
  pendiente: "#f59e0b",
  "en progreso": "#3b82f6",
  pausada: "#64748b",
};

export function TasksByStatusPieChart({
  data,
  filters,
  onFilterChange,
}: ChartProps) {
  const handleClick = (payload: ChartData) => {
    // 3. Lógica de toggle: si el filtro ya está activo, lo limpiamos pasando null.
    if (filters.status === payload.status) {
      onFilterChange(null);
    } else {
      onFilterChange({ status: payload.status });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tareas Activas por Estado</CardTitle>
        <CardDescription>
          Haz clic en una sección para filtrar todo el dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                onClick={handleClick}
                className="cursor-pointer"
              >
                {data.map((entry) => (
                  // Añadimos una opacidad si la sección no es el filtro activo
                  <Cell
                    key={`cell-${entry.status}`}
                    fill={COLORS[entry.status] || "#cccccc"}
                    className={cn(
                      filters.status &&
                        filters.status !== entry.status &&
                        "opacity-30"
                    )}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
