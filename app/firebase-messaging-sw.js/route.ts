import { NextResponse } from "next/server";

// Sirve el service worker con la config de Firebase inyectada desde variables de entorno.
// El SW en public/ no puede leer env vars de Next.js, por eso usamos esta ruta.
export async function GET() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const swContent = `
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getMessaging, onBackgroundMessage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-sw.js";

const firebaseConfig = ${JSON.stringify(config)};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  const notificationTitle = payload.notification?.title ?? "Nueva notificación";
  const notificationOptions = {
    body: payload.notification?.body ?? "",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    data: payload.data,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const taskId = event.notification?.data?.taskId;
  const url = taskId ? \`/tasks/\${taskId}\` : "/my-tasks";
  event.waitUntil(clients.openWindow(url));
});
`;

  return new NextResponse(swContent, {
    headers: {
      "Content-Type": "application/javascript",
      "Service-Worker-Allowed": "/",
    },
  });
}
