"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
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
  criticality: "baja" | "media" | "alta";
  count: number;
}
interface ChartProps {
  data: ChartData[];
  filters: Record<string, string>; // <-- Añadido
  onFilterChange: (filter: { criticality: string } | null) => void;
}

const COLORS = { baja: "#22c55e", media: "#f59e0b", alta: "#ef4444" };

export function TasksByCriticalityBarChart({
  data,
  filters,
  onFilterChange,
}: ChartProps) {
  const handleClick = (payload: ChartData) => {
    if (filters.criticality === payload.criticality) {
      onFilterChange(null);
    } else {
      onFilterChange({ criticality: payload.criticality });
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Tareas por Criticidad</CardTitle>
        <CardDescription>Distribución de tareas activas.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 10, top: 10 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="criticality"
              axisLine={false}
              tickLine={false}
              className="capitalize text-xs"
            />
            <Tooltip
              cursor={{ fill: "#fff" }}
              contentStyle={{
                borderColor: "hsl(var(--border))",
                borderRadius: "calc(var(--radius) - 2px)", // Un radio un poco más pequeño
                boxShadow:
                  "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              }}
            />
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              className="cursor-pointer"
              onClick={handleClick}
            >
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.criticality}`}
                  fill={COLORS[entry.criticality] || "#cccccc"}
                  className={cn(
                    filters.criticality &&
                      filters.criticality !== entry.criticality &&
                      "opacity-30 transition-opacity"
                  )}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
