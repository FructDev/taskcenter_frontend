// src/components/layout/Header.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, Tv2 } from "lucide-react"; // Usamos Sun como ícono genérico para el menú
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthStore } from "@/store/auth.store";
import { useAuth } from "@/hooks/use-auth"; // <-- 1. Importamos el hook para obtener los datos del usuario
import { Breadcrumbs } from "./Breadcrumbs"; // <-- 2. Importamos nuestro nuevo componente
import { DashboardNav } from "./DashboardNav";
import { ThemeToggle } from "./ThemeToggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Header() {
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const { user } = useAuth(); // <-- 3. Obtenemos los datos del usuario

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menú de navegación</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
          <div className="flex h-14 items-center border-b px-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
              <Image
                src="/icons/icon-192x192.png"
                alt="Logo"
                width={32}
                height={32}
              />
              <span>Girasol App</span>
            </Link>
          </div>
          <div className="flex-1 py-2 overflow-y-auto">
            {/* Usamos nuestro componente de navegación reutilizable aquí */}
            <DashboardNav />
          </div>
        </SheetContent>
      </Sheet>

      {/* 4. Reemplazamos el div vacío con las Breadcrumbs */}
      <div className="w-full flex-1">
        <Breadcrumbs />
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/wallboard" target="_blank">
              <Button variant="outline" size="icon">
                <Tv2 className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Abrir Modo Pizarra</span>
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Modo Pizarra / Wallboard</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            {/* 5. Conectamos el Avatar a los datos reales del usuario */}
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoUrl} alt={user?.name} />
              <AvatarFallback>
                {user?.name.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="sr-only">Abrir menú de usuario</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem disabled>Soporte</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
