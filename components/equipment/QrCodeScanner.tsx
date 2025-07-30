// src/components/equipment/QrCodeScanner.tsx
"use client";
import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface QrCodeScannerProps {
  onResult: (result: string) => void;
}

export function QrCodeScanner({ onResult }: QrCodeScannerProps) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader", // ID del div donde se renderizará
      {
        qrbox: { width: 250, height: 250 }, // Tamaño del cuadro de escaneo
        fps: 10, // Fotogramas por segundo para escanear
      },
      false // verbose
    );

    const handleScanSuccess = (decodedText: string) => {
      scanner.clear(); // Detiene el escáner
      onResult(decodedText); // Envía el resultado a la página
    };

    const handleScanError = () => {
      // Puedes ignorar errores comunes o loggearlos si lo deseas
      // console.warn(error);
    };

    scanner.render(handleScanSuccess, handleScanError);

    // Limpieza: se asegura de que la cámara se apague al cerrar el modal
    return () => {
      scanner.clear().catch((error) => {
        console.error("Fallo al limpiar el escáner de QR.", error);
      });
    };
  }, [onResult]);

  return <div id="qr-reader" className="w-full"></div>;
}
