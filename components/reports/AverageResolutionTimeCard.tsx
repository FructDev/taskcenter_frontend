// src/components/reports/AverageResolutionTimeCard.tsx
"use client";
import { useReport } from "@/hooks/use-report";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  //   CardDescription,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Timer } from "lucide-react";

interface AvgTimeData {
  averageMilliseconds: number;
  averageHours: number;
}

export function AverageResolutionTimeCard() {
  const { data, isLoading, isError } = useReport<AvgTimeData>(
    "average-resolution-time"
  );

  if (isLoading) return <Skeleton className="h-[160px] w-full" />;
  if (isError || !data)
    return (
      <Card className="h-[160px] flex items-center justify-center">
        <p className="text-destructive">No se pudo cargar.</p>
      </Card>
    );

  const hours = Math.floor(data.averageHours);
  const minutes = Math.round((data.averageHours - hours) * 60);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Tiempo Promedio de Resolución
        </CardTitle>
        <Timer className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {hours}h {minutes}m
        </div>
        <p className="text-xs text-muted-foreground">
          Desde el inicio hasta la completación de una tarea.
        </p>
      </CardContent>
    </Card>
  );
}
