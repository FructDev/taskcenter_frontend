// app/(app)/map/page.tsx
'use client';

import { PageHeader } from "@/components/common/page-header";
import { Construction } from "lucide-react";

export default function MapPlaceholderPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Mapa Operativo"
        description="Visualización geográfica de las tareas activas en el parque."
      />
      <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg p-12 min-h-[400px]">
        <Construction className="h-16 w-16 mb-4 text-slate-400" />
        <h2 className="text-2xl font-semibold">Funcionalidad en Desarrollo</h2>
        <p className="mt-2">El mapa interactivo estará disponible en una futura versión.</p>
      </div>
    </div>
  );
}
