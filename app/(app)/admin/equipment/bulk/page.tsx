// app/(app)/admin/equipment/bulk/page.tsx
"use client";
import { PageHeader } from "@/components/common/page-header";
import { BulkEquipmentForm } from "@/components/equipment/BulkEquipmentForm";

export default function BulkCreateEquipmentPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Creación de Equipos en Lote"
        description="Genera múltiples equipos que siguen un patrón de nomenclatura y numeración."
      />
      <BulkEquipmentForm />
    </div>
  );
}
