// src/components/layout/Sidebar.tsx
import Link from "next/link";
import Image from "next/image";
import { DashboardNav } from "./DashboardNav"; // <-- Importamos nuestro nuevo componente

export function Sidebar() {
  return (
    <aside className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
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
        <div className="flex-1 py-2 overflow-y-auto">
          <DashboardNav />
        </div>
      </div>
    </aside>
  );
}
