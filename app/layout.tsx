// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

// 1. Hemos enriquecido el objeto 'metadata'
export const metadata: Metadata = {
  title: "Parque Solar Girasol",
  description: "Software de Gestión de Tareas para el Parque Solar Girasol",
  manifest: "/manifest.json", // Le dice al navegador dónde encontrar el manifiesto
  themeColor: "#09090b", // Coincide con el color de tema en el manifiesto
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* 2. Hemos añadido etiquetas importantes en el <head> */}
      <head>
        {/* Asegura que la web sea responsive */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Icono para cuando se añade a la pantalla de inicio en iOS */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        {/* Opcional: para que se vea como una app nativa en iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Girasol App" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
