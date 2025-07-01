// src/lib/api.ts
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Este 'interceptor' es una pieza clave. Se ejecuta ANTES de cada petición.
// Su trabajo es tomar el token de nuestro store y añadirlo a la cabecera
// de autorización si existe.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
