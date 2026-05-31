// firebase-messaging-sw.js
// Usa importScripts (compatible con todos los navegadores/móviles)
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyDk9sscnTBrYcuqkayiUzzyHOYaZ2cIAqA",
  authDomain: "girasol-task-manager.firebaseapp.com",
  projectId: "girasol-task-manager",
  storageBucket: "girasol-task-manager.appspot.com",
  messagingSenderId: "853830025431",
  appId: "1:853830025431:web:367ae8aebca18ab28e7092",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("[SW] Mensaje en segundo plano:", payload);

  const title = payload.notification?.title ?? "Nueva notificación";
  const options = {
    body: payload.notification?.body ?? "",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    data: payload.data,
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const taskId = event.notification?.data?.taskId;
  const url = taskId ? "/tasks/" + taskId : "/my-tasks";
  event.waitUntil(clients.openWindow(url));
});
