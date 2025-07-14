// src/components/reports/KpiCards.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiData } from "@/types";
import { AlertTriangle, Check, Clock, ListTodo } from "lucide-react";

interface KpiCardsProps {
  kpiData?: KpiData;
  isLoading: boolean;
}

// Función de ayuda para formatear el tiempo
const formatMilliseconds = (ms: number) => {
  if (ms === 0) return "N/A";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

export function KpiCards({ kpiData, isLoading }: KpiCardsProps) {
  const balance =
    (kpiData?.completedThisMonth || 0) - (kpiData?.createdThisMonth || 0);

  const kpis = [
    { title: "Tareas Activas", value: kpiData?.activeTasks, icon: ListTodo },
    {
      title: "Tareas Vencidas",
      value: kpiData?.overdueTasks,
      icon: AlertTriangle,
      destructive: true,
    },
    {
      title: "Balance del Mes",
      value: `${balance > 0 ? "+" : ""}${balance}`,
      icon: Check,
      balance: true,
    },
    {
      title: "Resolución Promedio",
      value: formatMilliseconds(kpiData?.avgResolutionMilliseconds || 0),
      icon: Clock,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[120px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <kpi.icon
              className={`h-4 w-4 ${
                kpi.destructive ? "text-destructive" : "text-muted-foreground"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                kpi.destructive ? "text-destructive" : ""
              } ${
                kpi.balance
                  ? balance >= 0
                    ? "text-green-600"
                    : "text-destructive"
                  : ""
              }`}
            >
              {kpi.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
