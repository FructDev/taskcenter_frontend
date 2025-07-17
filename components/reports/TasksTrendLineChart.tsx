// src/components/reports/TasksTrendLineChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { es } from "date-fns/locale";
import { format } from "date-fns";

interface TrendData {
  month: {
    year: number;
    month: number;
  };
  created: number;
  completed: number;
}

interface TasksTrendLineChartProps {
  data?: TrendData[];
  isLoading: boolean;
}

export function TasksTrendLineChart({
  data,
  isLoading,
}: TasksTrendLineChartProps) {
  // Usamos useMemo para transformar los datos solo cuando cambien
  const chartData = useMemo(() => {
    return (
      data?.map((item) => ({
        // Creamos una etiqueta legible para el mes, ej: "Jul '25"
        name: format(
          new Date(item.month.year, item.month.month - 1),
          "MMM yy",
          { locale: es }
        ),
        Creadas: item.created,
        Completadas: item.completed,
      })) || []
    );
  }, [data]);

  if (isLoading) {
    return <Skeleton className="h-[400px]" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia de Tareas (Últimos 6 Meses)</CardTitle>
        <CardDescription>
          Comparativa de tareas creadas vs. completadas mensualmente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Creadas"
                stroke="#ef4444"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Completadas"
                stroke="#22c55e"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
