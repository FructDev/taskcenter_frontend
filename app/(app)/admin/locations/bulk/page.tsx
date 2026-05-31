"use client";
import { PageHeader } from "@/components/common/page-header";
import { BulkLocationForm } from "@/components/locations/BulkLocationForm";

export default function BulkCreateLocationsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Creación de Ubicaciones en Lote"
        description="Genera múltiples ubicaciones que siguen un patrón de nomenclatura y numeración."
      />
      <BulkLocationForm />
    </div>
  );
}
