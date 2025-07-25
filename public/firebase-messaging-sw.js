// public/firebase-messaging-sw.js

// Importamos los scripts de Firebase necesarios para el service worker
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
);

// --- PEGA TU OBJETO firebaseConfig COMPLETO AQUÍ ---
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "girasol-task-manager.appspot.com", // <-- Usa el formato corregido
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID",
};
// ----------------------------------------------------

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Este código se ejecuta cuando llega una notificación y la app no está en primer plano
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icons/icon-192x192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
