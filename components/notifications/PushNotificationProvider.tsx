// src/components/notifications/PushNotificationProvider.tsx
"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/lib/firebase";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

export function PushNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Solo ejecutamos esto si el usuario está autenticado
    if (!isAuthenticated) return;

    const requestPermission = async () => {
      if (!messaging) return;

      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          console.log("Permiso de notificación concedido.");

          // Obtenemos el token del dispositivo
          const currentToken = await getToken(messaging, {
            vapidKey:
              "BBerS5LNLWEPoPJ3D_FBU8WAxgccOTNLOQqwzs-gDSUTLnRX91sgyHyEtDKIYp8diBEkNboZeqBJFLlOhULG7NI	", // <-- PEGA TU VAPID KEY AQUÍ
          });

          if (currentToken) {
            console.log("Token FCM obtenido:", currentToken);
            // Enviamos el token a nuestro backend para guardarlo
            await api.post("/notifications/subscribe", { token: currentToken });
          } else {
            console.log("No se pudo obtener el token de registro.");
          }
        } else {
          console.log("El usuario no concedió permiso para notificaciones.");
        }
      } catch (error) {
        console.error(
          "Ocurrió un error al solicitar el permiso de notificación:",
          error
        );
      }
    };

    requestPermission();

    // Manejador para cuando llega una notificación y la app está en primer plano
    const unsubscribe = onMessage(messaging!, (payload) => {
      console.log("Mensaje recibido en primer plano. ", payload);
      toast.info(payload.notification?.title, {
        description: payload.notification?.body,
      });
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated]);

  return <>{children}</>;
}
