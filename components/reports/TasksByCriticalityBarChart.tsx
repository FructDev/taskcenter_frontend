// src/components/reports/TasksByCriticalityBarChart.tsx
"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  //   Legend,
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

interface CriticalityReportData {
  criticality: string;
  count: number;
}

export function TasksByCriticalityBarChart() {
  const { data, isLoading, isError } = useReport<CriticalityReportData[]>(
    "tasks-by-criticality"
  );
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
        <CardTitle>Tareas por Criticidad</CardTitle>
        <CardDescription>
          Conteo de tareas según su nivel de criticidad.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical">
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="criticality"
                width={80}
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
