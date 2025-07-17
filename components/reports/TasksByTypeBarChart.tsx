// src/components/reports/TasksByTypeBarChart.tsx
"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  //   Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface ChartData {
  taskType: string;
  count: number;
}

interface ChartProps {
  data: ChartData[];
  onFilterChange: (filter: { taskType: string }) => void;
}

export function TasksByTypeBarChart({ data, onFilterChange }: ChartProps) {
  // Damos formato a los datos para que el gráfico los muestre mejor
  const chartData = data.map((item) => ({
    // Capitalizamos y quitamos guiones bajos para una mejor lectura
    name:
      item.taskType.charAt(0).toUpperCase() +
      item.taskType.slice(1).replace(/_/g, " "),
    // El valor real que se usará en el onClick
    taskType: item.taskType,
    "Nº Tareas": item.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tareas por Tipo</CardTitle>
        <CardDescription>
          Distribución de tareas activas por su naturaleza.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
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
                fill="#3b82f6" /* blue-500 */
                radius={[0, 4, 4, 0]}
                className="cursor-pointer"
                onClick={(payload) =>
                  onFilterChange({ taskType: payload.taskType })
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
