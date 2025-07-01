// src/components/auth/LoginForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/handle-error";
import { FormError } from "@/components/ui/form-error";
import { jwtDecode } from "jwt-decode"; // <-- Importar
import { UserRole } from "@/types";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token } = response.data;

      setToken(access_token);
      const decodedToken: { role: UserRole } = jwtDecode(access_token);
      if (decodedToken.role === UserRole.TECNICO) {
        router.push("/my-tasks");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm mx-4 shadow-lg">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {/* Usamos tu ícono real */}
          <Image
            src="/icons/icon-192x192.png"
            alt="Logo Girasol"
            width={80}
            height={80}
          />
        </div>
        <CardTitle className="text-2xl">Parque Solar Girasol</CardTitle>
        <CardDescription>
          Bienvenido. Ingrese sus credenciales para acceder.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full mt-5" disabled={isLoading}>
            {isLoading ? "Ingresando..." : "Iniciar Sesión"}
          </Button>
          <FormError message={error} />
        </CardFooter>
      </form>
    </Card>
  );
}
