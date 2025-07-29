"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"; // <-- Añadimos Cell
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TaskTypeEnum } from "@/types";

interface ChartData {
  taskType: TaskTypeEnum;
  count: number;
}

interface ChartProps {
  data: ChartData[];
  filters: Record<string, string>;
  onFilterChange: (filter: { taskType: string } | null) => void;
}

export function TasksByTypeBarChart({
  data,
  filters,
  onFilterChange,
}: ChartProps) {
  const chartData = data.map((item) => ({
    name:
      item.taskType.charAt(0).toUpperCase() +
      item.taskType.slice(1).replace(/_/g, " "),
    taskType: item.taskType,
    "Nº Tareas": item.count,
  }));

  const handleClick = (payload: { taskType: TaskTypeEnum }) => {
    if (filters.taskType === payload.taskType) {
      onFilterChange(null);
    } else {
      onFilterChange({ taskType: payload.taskType });
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Tareas por Tipo</CardTitle>
        <CardDescription>
          Distribución de tareas activas por su naturaleza.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 40, top: 10 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              axisLine={false}
              tickLine={false}
              className="text-xs"
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
              dataKey="Nº Tareas"
              radius={[0, 4, 4, 0]}
              className="cursor-pointer"
              onClick={handleClick}
            >
              {/* Le damos a cada barra el mismo color primario */}
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill="#3b82f6" /* blue-500 */
                  className={cn(
                    filters.taskType &&
                      filters.taskType !== entry.taskType &&
                      "opacity-30"
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
