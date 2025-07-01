// src/lib/utils/handle-error.ts
import axios from "axios";

// Esta función recibe un error de tipo 'unknown' y siempre devuelve un string.
export const getErrorMessage = (error: unknown): string => {
  // Primero, verificamos si el error es una instancia de AxiosError.
  // axios.isAxiosError es una "guarda de tipo" que nos da seguridad.
  if (axios.isAxiosError(error)) {
    // Si es un error de Axios, sabemos que puede tener una respuesta del servidor.
    // Intentamos acceder al mensaje de nuestra API.
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    // Si no, devolvemos un mensaje genérico de error de red.
    return "Error de red o el servidor no responde.";
  }

  // Si es un error genérico de JavaScript, devolvemos su mensaje.
  if (error instanceof Error) {
    return error.message;
  }

  // Como última opción, si el error es algo inesperado (ej. un string),
  // devolvemos un mensaje por defecto.
  return "Ocurrió un error inesperado.";
};
