"use client";
import { useRef, useState } from "react";
import { ImagePlus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useParkMapStore } from "@/store/park-map.store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ParkMapSettings() {
  const { imageUrl, imageWidth, imageHeight, setMap, clearMap } =
    useParkMapStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Leer dimensiones de la imagen antes de subir
    const dims = await new Promise<{ width: number; height: number }>(
      (resolve) => {
        const img = new Image();
        img.onload = () =>
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.src = URL.createObjectURL(file);
      }
    );

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMap(res.data.url, dims.width, dims.height);
      toast.success("Imagen del parque guardada.");
    } catch {
      toast.error("Error al subir la imagen.");
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Imagen del Parque Solar</CardTitle>
        <CardDescription>
          Sube el plano o foto aérea del parque. Se usará como fondo en el mapa
          operativo y en el selector de coordenadas de ubicaciones.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {imageUrl ? (
          <div className="space-y-3">
            <div className="relative rounded-md overflow-hidden border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Plano del parque"
                className="w-full max-h-48 object-contain bg-muted"
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-full">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                {imageWidth}×{imageHeight}px
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={isUploading}
              >
                <ImagePlus className="h-4 w-4 mr-1.5" />
                Cambiar imagen
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearMap();
                  toast.success("Imagen eliminada.");
                }}
              >
                <Trash2 className="h-4 w-4 mr-1.5 text-destructive" />
                Eliminar
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={isUploading}
            className="flex flex-col items-center gap-3 w-full border-2 border-dashed rounded-lg p-8 hover:bg-muted/50 transition-colors text-muted-foreground"
          >
            <ImagePlus className="h-10 w-10 opacity-40" />
            <div className="text-sm">
              <p className="font-medium">
                {isUploading ? "Subiendo..." : "Subir plano del parque"}
              </p>
              <p className="text-xs">PNG, JPG o WebP — recomendado mínimo 1920×1080</p>
            </div>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleUpload}
        />
      </CardContent>
    </Card>
  );
}
