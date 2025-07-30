// src/lib/utils/cron-parser.ts

type FrequencyType = "daily" | "weekly" | "monthly";

interface ParsedCron {
  frequency: FrequencyType;
  daysOfWeek: string[];
  dayOfMonth: number;
  time: string;
}

// Función que toma un cron string o una fecha y la convierte al estado de nuestra UI
export function parseCronExpression(cronOrDate: string): ParsedCron {
  const defaults: ParsedCron = {
    frequency: "weekly",
    daysOfWeek: [],
    dayOfMonth: 1,
    time: "07:00",
  };

  // Caso 1: Viene una fecha del calendario (ej: "2025-08-15")
  if (cronOrDate.includes("-")) {
    try {
      const date = new Date(cronOrDate);
      const day = date.getUTCDay(); // Domingo=0, Lunes=1
      const weekDay =
        day === 0 ? "SUN" : ["MON", "TUE", "WED", "THU", "FRI", "SAT"][day - 1];

      return {
        ...defaults,
        frequency: "weekly",
        daysOfWeek: [weekDay],
        dayOfMonth: date.getUTCDate(),
      };
    } catch (e) {
      console.log(e);
      return defaults; // Si la fecha es inválida, devuelve los valores por defecto
    }
  }

  // Caso 2: Viene un cron string (ej: "0 7 * * MON,WED")
  const parts = cronOrDate.split(" ");
  if (parts.length !== 5) {
    return defaults; // Si el cron es inválido, devuelve los valores por defecto
  }

  const [minute, hour, dayOfMonth, dayOfWeek] = parts;

  const parsedTime = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;

  if (dayOfWeek !== "*") {
    return {
      frequency: "weekly",
      daysOfWeek: dayOfWeek.split(","),
      dayOfMonth: defaults.dayOfMonth,
      time: parsedTime,
    };
  }

  if (dayOfMonth !== "*") {
    return {
      frequency: "monthly",
      daysOfWeek: defaults.daysOfWeek,
      dayOfMonth: parseInt(dayOfMonth, 10),
      time: parsedTime,
    };
  }

  return {
    frequency: "daily",
    daysOfWeek: defaults.daysOfWeek,
    dayOfMonth: defaults.dayOfMonth,
    time: parsedTime,
  };
}
