// app/(app)/profile/page.tsx
"use client";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  //   CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common/page-header";
import { UpdatePasswordForm } from "@/components/profile/UpdatePasswordForm";
import { ChangeEvent, useRef } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/handle-error";

export default function ProfilePage() {
  const { user, isLoading, mutate } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading("Subiendo foto de perfil...");
    try {
      await api.post("/auth/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Foto actualizada.", { id: toastId });
      mutate(); // Refrescamos los datos del usuario
    } catch (error) {
      toast.error("Error al subir la foto", {
        id: toastId,
        description: getErrorMessage(error),
      });
    }
  };

  if (isLoading) return <div>Cargando perfil...</div>;
  if (!user) return <div>No se pudo cargar el perfil del usuario.</div>;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Mi Perfil"
        description="Gestiona la información de tu cuenta y tus preferencias."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32 border">
                <AvatarImage src={user.photoUrl} alt={user.name} />
                <AvatarFallback className="text-3xl">
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                className="hidden"
                accept="image/png, image/jpeg"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Cambiar Foto
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input defaultValue={user.name} disabled />
              </div>
              <div>
                <Label>Email</Label>
                <Input defaultValue={user.email} disabled />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input defaultValue={user.phone} disabled />
              </div>
              <div>
                <Label>Departamento</Label>
                <Input defaultValue={user.department} disabled />
              </div>
            </CardContent>
          </Card>

          <UpdatePasswordForm />
        </div>
      </div>
    </div>
  );
}
