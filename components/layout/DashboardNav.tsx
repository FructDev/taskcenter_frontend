// src/components/layout/DashboardNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/types";

import {
  ClipboardList,
  Home,
  Map,
  Users,
  Building,
  BarChart4,
  FileText,
  History,
  CalendarClock,
  HardHat,
  ShieldCheck,
  Users2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function DashboardNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const dashboardHref =
    user?.role === UserRole.TECNICO ? "/my-tasks" : "/dashboard";

  const mainNavItems = [
    { href: dashboardHref, label: "Dashboard", icon: Home },
    { href: "/tasks", label: "Tareas", icon: ClipboardList },
    { href: "/activity", label: "Bitácora", icon: History },
    { href: "/reports", label: "Informes", icon: BarChart4 },
    { href: "/workload", label: "Carga de Equipo", icon: Users2 },
  ];

  const adminNavItems = [
    { href: "/admin/users", label: "Usuarios", icon: Users },
    { href: "/admin/contractors", label: "Contratistas", icon: Building },
    { href: "/admin/locations", label: "Ubicaciones", icon: Map },
    { href: "/admin/equipment", label: "Equipos", icon: HardHat },
    { href: "/admin/templates", label: "Plantillas", icon: FileText },
    {
      href: "/admin/scheduled-tasks",
      label: "Tareas Programadas",
      icon: CalendarClock,
    },
    { href: "/admin/ppe-items", label: "EPP / Seguridad", icon: ShieldCheck },
  ];

  const isAdminOrSupervisor =
    user &&
    [UserRole.ADMIN, UserRole.SUPERVISOR].includes(user.role as UserRole);

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {mainNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
              isActive ? "bg-muted text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}

      <div
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground opacity-60 cursor-not-allowed"
        title="Funcionalidad en desarrollo"
      >
        <Map className="h-4 w-4" />
        <span>Mapa Operativo</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          Próximamente
        </Badge>
      </div>

      {isAdminOrSupervisor && (
        <>
          <Separator className="my-4" />
          <h3 className="px-3 pt-2 pb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
            Administración
          </h3>
          {adminNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  isActive ? "bg-muted text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </>
      )}
    </nav>
  );
}
