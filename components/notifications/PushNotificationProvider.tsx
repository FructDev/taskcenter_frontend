// src/components/notifications/PushNotificationProvider.tsx
"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/lib/firebase";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { mutate } from "swr";

export function PushNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const requestPermission = async () => {
      if (!messaging) return;

      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          console.log("Permiso de notificación concedido.");

          const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

          // Esperamos a que el SW existente esté listo antes de pedir el token
          const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js"
          );
          await navigator.serviceWorker.ready;

          const currentToken = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration: registration,
          });

          if (currentToken) {
            console.log("Token FCM obtenido:", currentToken);
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

    const unsubscribe = onMessage(messaging!, (payload) => {
      console.log("Mensaje recibido en primer plano. ", payload);
      toast.info(payload.notification?.title, {
        description: payload.notification?.body,
      });
      mutate("/notifications/my");
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated]);

  return <>{children}</>;
}
