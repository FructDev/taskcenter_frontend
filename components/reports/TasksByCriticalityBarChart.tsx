// src/components/reports/TasksByCriticalityBarChart.tsx
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

interface ChartData {
  criticality: "baja" | "media" | "alta";
  count: number;
}

interface ChartProps {
  data: ChartData[];
  onFilterChange: (filter: { criticality: string }) => void;
}

// Definimos colores para cada nivel de criticidad
const COLORS = {
  baja: "#22c55e", // green-500
  media: "#f59e0b", // amber-500
  alta: "#ef4444", // red-500
};

export function TasksByCriticalityBarChart({
  data,
  onFilterChange,
}: ChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tareas por Criticidad</CardTitle>
        <CardDescription>
          Distribución de tareas activas por urgencia.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
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
                onClick={(payload) =>
                  onFilterChange({ criticality: payload.criticality })
                }
              >
                {data.map((entry) => (
                  <Cell
                    key={`cell-${entry.criticality}`}
                    fill={COLORS[entry.criticality] || "#cccccc"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
