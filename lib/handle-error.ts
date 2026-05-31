// src/lib/utils/handle-error.ts
import axios from "axios";

export const isOfflineQueued = (error: unknown): boolean => {
  return error instanceof Error && error.message === "OFFLINE_QUEUED";
};

// Esta función recibe un error de tipo 'unknown' y siempre devuelve un string.
export const getErrorMessage = (error: unknown): string => {
  // Acción encolada por modo offline
  if (isOfflineQueued(error)) {
    return "Sin conexión — la acción se guardó y se enviará cuando vuelva internet.";
  }

  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    return "Error de red o el servidor no responde.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado.";
};
