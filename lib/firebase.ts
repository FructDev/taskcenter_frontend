// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDk9sscnTBrYcuqkayiUzzyHOYaZ2cIAqA",
  authDomain: "girasol-task-manager.firebaseapp.com",
  projectId: "girasol-task-manager",
  storageBucket: "girasol-task-manager.appspot.com",
  messagingSenderId: "853830025431",
  appId: "1:853830025431:web:367ae8aebca18ab28e7092",
};

// Inicializa Firebase solo si no ha sido inicializado antes
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Exportamos la instancia de messaging para usarla en otros componentes
export const messaging =
  typeof window !== "undefined" ? getMessaging(app) : undefined;
