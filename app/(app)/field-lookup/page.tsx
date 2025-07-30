// app/(app)/field-lookup/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { EquipmentCombobox } from "@/components/equipment/EquipmentCombobox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QrCodeScanner } from "@/components/equipment/QrCodeScanner";
import api from "@/lib/api";
import { toast } from "sonner";

export default function FieldLookupPage() {
  const router = useRouter();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Se activa cuando el técnico selecciona un equipo del combobox
  const handleEquipmentSelect = (equipmentId: string) => {
    if (equipmentId) {
      router.push(`/admin/equipment/${equipmentId}`);
    }
  };

  // Se activa cuando el escáner QR lee un código
  const handleQrCodeResult = async (code: string) => {
    setIsScannerOpen(false);
    try {
      // Usamos nuestro endpoint de búsqueda para encontrar el equipo por su código
      const response = await api.get(`/equipment?search=${code}`);
      if (response.data.data.length > 0) {
        const equipmentId = response.data.data[0]._id;
        router.push(`/equipment/${equipmentId}`);
      } else {
        toast.error(`No se encontró ningún equipo con el código "${code}".`);
      }
    } catch (error) {
      toast.error(`Error al buscar el equipo. ${error}`);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Consulta de Activos en Campo"
          description="Busca cualquier equipo por su nombre, código o escaneando su QR."
        />
        <Card className="max-w-2xl mx-auto w-full">
          <CardHeader>
            <CardTitle>Buscar Equipo</CardTitle>
            <CardDescription>
              Empieza a escribir o presiona el botón para escanear.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <EquipmentCombobox onChange={handleEquipmentSelect} />
            <Button variant="outline" onClick={() => setIsScannerOpen(true)}>
              <QrCode className="mr-2 h-4 w-4" />
              Escanear Código QR
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apunta la cámara al Código QR</DialogTitle>
          </DialogHeader>
          <QrCodeScanner onResult={handleQrCodeResult} />
        </DialogContent>
      </Dialog>
    </>
  );
}
