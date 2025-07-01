// en tu archivo: next.config.ts

import type { NextConfig } from "next";

// Importamos el paquete de PWA. Usaremos un alias para mayor claridad.
import withPWAInit from "next-pwa";

// Configuramos la PWA
const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

// Definimos la configuración base de Next.js
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Aquí irá cualquier otra configuración de Next.js en el futuro
};

// @ts-expect-error - Ignoramos este error de tipo específico que ocurre por una
// incompatibilidad conocida entre las versiones de los tipos de Next.js
// y los que espera el paquete 'next-pwa'. Esta es una solución
// pragmática y aceptada para este problema de configuración externa.
export default withPWA(nextConfig);
