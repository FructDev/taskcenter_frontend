// src/lib/utils/icon-map.ts
import {
  HardHat,
  Hand,
  Footprints,
  Shield,
  Glasses,
  Ear,
  Anchor,
} from "lucide-react";

export const getPpeIcon = (ppeName: string) => {
  const name = ppeName.toLowerCase();
  if (name.includes("casco")) return HardHat;
  if (name.includes("guantes")) return Hand;
  if (name.includes("botas")) return Footprints;
  if (name.includes("arnés")) return Anchor;
  if (name.includes("gafas") || name.includes("lentes")) return Glasses;
  if (name.includes("auditiva") || name.includes("oídos")) return Ear;
  // Ícono por defecto si no hay coincidencia
  return Shield;
};
