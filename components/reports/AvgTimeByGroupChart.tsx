// src/components/reports/AvgTimeByGroupChart.tsx
"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
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

interface AvgTimeData {
  group: string;
  averageHours: number;
}

interface AvgTimeByGroupChartProps {
  reportName: "avg-time-by-criticality" | "avg-time-by-type";
  title: string;
  description: string;
}

// Helper para formatear las horas a "Xh Ym"
const formatHours = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

export function AvgTimeByGroupChart({
  reportName,
  title,
  description,
}: AvgTimeByGroupChartProps) {
  const { data, isLoading, isError } = useReport<AvgTimeData[]>(reportName);
  if (isLoading) return <Skeleton className="h-[350px] w-full" />;
  if (isError || !data)
    return (
      <Card className="h-[350px] flex items-center justify-center">
        <p className="text-destructive">No se pudo cargar el informe.</p>
      </Card>
    );

  const chartData = data.map((item) => ({
    name: item.group.charAt(0).toUpperCase() + item.group.slice(1), // Capitalizar
    "Tiempo (Horas)": parseFloat(item.averageHours.toFixed(2)),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 250 }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis tickFormatter={(value) => `${value}h`} />
              <Tooltip
                formatter={(value: number) => [formatHours(value), "Promedio"]}
              />
              <Legend />
              <Bar
                dataKey="Tiempo (Horas)"
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
