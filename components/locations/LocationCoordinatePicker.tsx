"use client";
import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { useParkMapStore } from "@/store/park-map.store";

interface LocationCoordinatePickerProps {
  lat?: number;
  lng?: number;
  onChange: (coords: { lat: number; lng: number }) => void;
}

const PARK_CENTER: [number, number] = [18.2833, -70.1167];

export function LocationCoordinatePicker({
  lat,
  lng,
  onChange,
}: LocationCoordinatePickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const { imageUrl, imageWidth, imageHeight } = useParkMapStore();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      let map: ReturnType<typeof L.map>;

      if (imageUrl && imageWidth && imageHeight) {
        // ── Modo imagen personalizada del parque ──────────────────────
        const bounds: [[number, number], [number, number]] = [
          [0, 0],
          [imageHeight, imageWidth],
        ];

        map = L.map(mapRef.current!, {
          crs: L.CRS.Simple,
          minZoom: -3,
          maxZoom: 3,
          zoomControl: true,
        });

        L.imageOverlay(imageUrl, bounds).addTo(map);
        if (mapRef.current) {
          (mapRef.current as HTMLElement).style.background = "#111";
        }

        // Zoom tipo "cover"
        const fitCover = () => {
          map.invalidateSize();
          const container = map.getSize();
          const coverScale = Math.max(
            container.x / imageWidth,
            container.y / imageHeight
          );
          const coverZoom = Math.log2(coverScale);
          // Si ya hay coordenadas, centramos en ellas; si no, en el centro de la imagen
          const center: [number, number] =
            lat != null && lng != null
              ? [lat, lng]
              : [imageHeight / 2, imageWidth / 2];
          map.setView(center, coverZoom, { animate: false });
        };

        setTimeout(fitCover, 80);

        if (lat != null && lng != null) {
          markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
          markerRef.current.on("dragend", () => {
            const p = markerRef.current.getLatLng();
            onChange({ lat: Math.round(p.lat), lng: Math.round(p.lng) });
          });
        }

        map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
          const coords = {
            lat: Math.round(e.latlng.lat),
            lng: Math.round(e.latlng.lng),
          };
          if (markerRef.current) {
            markerRef.current.setLatLng([coords.lat, coords.lng]);
          } else {
            markerRef.current = L.marker([coords.lat, coords.lng], { draggable: true }).addTo(map);
            markerRef.current.on("dragend", () => {
              const p = markerRef.current.getLatLng();
              onChange({ lat: Math.round(p.lat), lng: Math.round(p.lng) });
            });
          }
          onChange(coords);
        });
      } else {
        // ── Modo OpenStreetMap (fallback sin imagen) ──────────────────
        const center: [number, number] =
          lat != null && lng != null ? [lat, lng] : PARK_CENTER;

        map = L.map(mapRef.current!, {
          center,
          zoom: lat != null && lng != null ? 17 : 14,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);

        if (lat != null && lng != null) {
          markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
          markerRef.current.on("dragend", () => {
            const p = markerRef.current.getLatLng();
            onChange({ lat: parseFloat(p.lat.toFixed(6)), lng: parseFloat(p.lng.toFixed(6)) });
          });
        }

        map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
          const coords = {
            lat: parseFloat(e.latlng.lat.toFixed(6)),
            lng: parseFloat(e.latlng.lng.toFixed(6)),
          };
          if (markerRef.current) {
            markerRef.current.setLatLng([coords.lat, coords.lng]);
          } else {
            markerRef.current = L.marker([coords.lat, coords.lng], { draggable: true }).addTo(map);
            markerRef.current.on("dragend", () => {
              const p = markerRef.current.getLatLng();
              onChange({ lat: parseFloat(p.lat.toFixed(6)), lng: parseFloat(p.lng.toFixed(6)) });
            });
          }
          onChange(coords);
        });
      }

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, imageWidth, imageHeight]);

  const coordLabel = lat != null && lng != null
    ? imageUrl
      ? `Pixel (${lng}, ${lat})`
      : `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    : imageUrl
    ? "Haz clic en el plano para fijar la posición"
    : "Haz clic en el mapa para fijar la posición";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 shrink-0" />
        <span>{coordLabel}</span>
        {imageUrl && (
          <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            Usando plano del parque
          </span>
        )}
      </div>
      <div
        ref={mapRef}
        className="h-56 w-full rounded-md border overflow-hidden"
        style={{ zIndex: 0 }}
      />
    </div>
  );
}
