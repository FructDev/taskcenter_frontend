// src/components/theme-provider.tsx
"use client";

import * as React from "react";
// La importación de tipos ahora se hace desde el paquete principal
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
