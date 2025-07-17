// src/components/layout/Sidebar.tsx
import Link from "next/link";
import Image from "next/image";
import { DashboardNav } from "./DashboardNav"; // <-- Importamos nuestro nuevo componente

export function Sidebar() {
  return (
    /* 👇 fijo a la izquierda en pantallas ≥ md */
    <aside className="hidden border-r bg-muted/40 md:block w-[220px] lg:w-[280px]">
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-14 items-center border-b px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <Image
              src="/icons/icon-192x192.png"
              alt="Logo"
              width={28}
              height={28}
            />
            <span>Parque Solar Girasol</span>
          </Link>
        </div>

        {/* Propio scroll para el menú si crece */}
        <div className="flex-1 overflow-y-auto py-2">
          <DashboardNav />
        </div>
      </div>
    </aside>
  );
}
