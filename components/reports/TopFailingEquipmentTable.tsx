// src/components/reports/TopFailingEquipmentTable.tsx
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { HardHat } from "lucide-react";

interface EquipmentData {
  equipmentId: string;
  equipmentName: string;
  count: number;
}

interface TopFailingEquipmentTableProps {
  data?: EquipmentData[];
  isLoading: boolean;
  onFilterChange: (filter: { equipmentId: string }) => void;
}

export function TopFailingEquipmentTable({
  data,
  isLoading,
  onFilterChange,
}: TopFailingEquipmentTableProps) {
  if (isLoading) {
    return <Skeleton className="h-[350px]" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Equipos con Más Fallos</CardTitle>
        <CardDescription>
          Equipos con más mantenimientos correctivos registrados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data?.map((item) => (
            <div
              key={item.equipmentId}
              className="flex items-center cursor-pointer hover:bg-muted/50 p-2 rounded-md"
              onClick={() => onFilterChange({ equipmentId: item.equipmentId })}
            >
              <div className="flex items-center gap-4">
                <HardHat className="h-5 w-5 text-muted-foreground" />
                <p className="font-medium">{item.equipmentName}</p>
              </div>
              <div className="ml-auto font-semibold">{item.count} fallos</div>
            </div>
          ))}
          {(!data || data.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay datos de mantenimientos correctivos.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
