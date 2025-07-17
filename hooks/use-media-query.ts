import { useEffect, useState } from "react";

/**
 * Devuelve:
 *   • `true`  → la media query coincide
 *   • `false` → no coincide
 *   • `undefined` → aún no sabemos (solo sucede durante SSR / primer render)
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // Evita ejecutar en SSR
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);

    // Establece el valor inicial y suscribe cambios
    listener();
    media.addEventListener("change", listener);

    // Limpieza
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
