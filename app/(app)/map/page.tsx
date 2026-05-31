"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const OperationalMap = dynamic(
  () => import("@/components/map/OperationalMap").then((m) => m.OperationalMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full">
        <div className="w-72 border-r bg-background">
          <div className="p-4 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-2">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <Skeleton className="flex-1" />
      </div>
    ),
  }
);

export default function MapPage() {
  return <OperationalMap />;
}
