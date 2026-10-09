"use client";
import { useEffect, useRef } from "react";
import { SquareDashedMousePointer } from "lucide-react";
import { useParkMapStore } from "@/store/park-map.store";

interface Bounds {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface LocationBoundsPickerProps {
  bounds?: Bounds;
  onChange: (bounds: Bounds) => void;
}

export function LocationBoundsPicker({ bounds, onChange }: LocationBoundsPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rectRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const previewRectRef = useRef<any>(null);
  const drawingRef = useRef<{ lat: number; lng: number } | null>(null);
  const { imageUrl, imageWidth, imageHeight } = useParkMapStore();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || !imageUrl || !imageWidth || !imageHeight) return;

    import("leaflet").then((L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const imageBounds: [[number, number], [number, number]] = [[0, 0], [imageHeight, imageWidth]];

      const map = L.map(mapRef.current!, {
        crs: L.CRS.Simple,
        minZoom: -3,
        maxZoom: 3,
        zoomControl: true,
      });

      L.imageOverlay(imageUrl, imageBounds).addTo(map);
      if (mapRef.current) (mapRef.current as HTMLElement).style.background = "#111";

      const fitCover = () => {
        map.invalidateSize();
        const container = map.getSize();
        const coverScale = Math.max(container.x / imageWidth, container.y / imageHeight);
        const coverZoom = Math.log2(coverScale);
        const center: [number, number] = bounds
          ? [(bounds.y1 + bounds.y2) / 2 * imageHeight, (bounds.x1 + bounds.x2) / 2 * imageWidth]
          : [imageHeight / 2, imageWidth / 2];
        map.setView(center, coverZoom, { animate: false });
      };
      setTimeout(fitCover, 80);

      // Show existing bounds
      if (bounds) {
        const sw: [number, number] = [bounds.y1 * imageHeight, bounds.x1 * imageWidth];
        const ne: [number, number] = [bounds.y2 * imageHeight, bounds.x2 * imageWidth];
        rectRef.current = L.rectangle([sw, ne], {
          color: "#3b82f6",
          weight: 2,
          fillColor: "#3b82f6",
          fillOpacity: 0.25,
        }).addTo(map);
      }

      // Rectangle drawing: mousedown → mousemove → mouseup
      map.on("mousedown", (e: { latlng: { lat: number; lng: number }; originalEvent: MouseEvent }) => {
        if (e.originalEvent.button !== 0) return;
        drawingRef.current = { lat: e.latlng.lat, lng: e.latlng.lng };

        if (previewRectRef.current) {
          previewRectRef.current.remove();
          previewRectRef.current = null;
        }
        map.dragging.disable();
      });

      map.on("mousemove", (e: { latlng: { lat: number; lng: number } }) => {
        if (!drawingRef.current) return;
        const start = drawingRef.current;
        const sw: [number, number] = [Math.min(start.lat, e.latlng.lat), Math.min(start.lng, e.latlng.lng)];
        const ne: [number, number] = [Math.max(start.lat, e.latlng.lat), Math.max(start.lng, e.latlng.lng)];

        if (previewRectRef.current) {
          previewRectRef.current.setBounds([sw, ne]);
        } else {
          previewRectRef.current = L.rectangle([sw, ne], {
            color: "#3b82f6",
            weight: 2,
            dashArray: "6 4",
            fillColor: "#3b82f6",
            fillOpacity: 0.15,
          }).addTo(map);
        }
      });

      map.on("mouseup", (e: { latlng: { lat: number; lng: number } }) => {
        if (!drawingRef.current) return;
        map.dragging.enable();

        const start = drawingRef.current;
        drawingRef.current = null;

        const rawX1 = Math.min(start.lng, e.latlng.lng) / imageWidth;
        const rawY1 = Math.min(start.lat, e.latlng.lat) / imageHeight;
        const rawX2 = Math.max(start.lng, e.latlng.lng) / imageWidth;
        const rawY2 = Math.max(start.lat, e.latlng.lat) / imageHeight;

        // Clamp to [0, 1]
        const newBounds: Bounds = {
          x1: Math.max(0, Math.min(1, rawX1)),
          y1: Math.max(0, Math.min(1, rawY1)),
          x2: Math.max(0, Math.min(1, rawX2)),
          y2: Math.max(0, Math.min(1, rawY2)),
        };

        if (Math.abs(newBounds.x2 - newBounds.x1) < 0.002) return; // too small, ignore

        if (previewRectRef.current) {
          previewRectRef.current.remove();
          previewRectRef.current = null;
        }
        if (rectRef.current) {
          rectRef.current.remove();
        }

        const sw: [number, number] = [newBounds.y1 * imageHeight, newBounds.x1 * imageWidth];
        const ne: [number, number] = [newBounds.y2 * imageHeight, newBounds.x2 * imageWidth];
        rectRef.current = L.rectangle([sw, ne], {
          color: "#3b82f6",
          weight: 2,
          fillColor: "#3b82f6",
          fillOpacity: 0.25,
        }).addTo(map);

        onChange(newBounds);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        rectRef.current = null;
        previewRectRef.current = null;
        drawingRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, imageWidth, imageHeight]);

  if (!imageUrl) {
    return (
      <div className="h-56 w-full rounded-md border bg-muted flex items-center justify-center text-sm text-muted-foreground">
        Configura el plano del parque en Admin → Ubicaciones para definir bloques.
      </div>
    );
  }

  const boundsLabel = bounds
    ? `(${(bounds.x1 * 100).toFixed(1)}%, ${(bounds.y1 * 100).toFixed(1)}%) → (${(bounds.x2 * 100).toFixed(1)}%, ${(bounds.y2 * 100).toFixed(1)}%)`
    : "Haz clic y arrastra para dibujar el rectángulo del bloque";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <SquareDashedMousePointer className="h-4 w-4 shrink-0" />
        <span>{boundsLabel}</span>
      </div>
      <div
        ref={mapRef}
        className="h-56 w-full rounded-md border overflow-hidden cursor-crosshair"
        style={{ zIndex: 0 }}
      />
    </div>
  );
}
