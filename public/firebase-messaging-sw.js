// public/firebase-messaging-sw.js

// Usamos la sintaxis de import moderna
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getMessaging,
  onBackgroundMessage,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-sw.js";

// --- PEGA TU OBJETO firebaseConfig COMPLETO AQUÍ ---
const firebaseConfig = {
  apiKey: "AIzaSyDk9sscnTBrYcuqkayiUzzyHOYaZ2cIAqA",
  authDomain: "girasol-task-manager.firebaseapp.com",
  projectId: "girasol-task-manager",
  storageBucket: "girasol-task-manager.appspot.com",
  messagingSenderId: "853830025431",
  appId: "1:853830025431:web:367ae8aebca18ab28e7092",
};
// ----------------------------------------------------

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log(
    "[firebase-messaging-sw.js] Mensaje recibido en segundo plano.",
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icons/icon-192x192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
