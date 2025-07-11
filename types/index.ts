// src/types/index.ts
export enum LocationTypeEnum {
  PS_GIRASOL = "ps_girasol",
  POWER_STATION = "power_station",
  BLOCK = "block",
  ROW = "row",
  INVERSOR = "inversor",
  SCB = "scb",
  STRING = "string",
  WEATHER_STATION = "weather_station",
  SUBSTATION = "substation",
  BUILDING = "building",
  PERIMETER_FENCE = "perimeter_fence",
  SECURITY_BOOTH = "security_booth",
  LIGHTING_POLE = "lighting_pole",
  ARBORETUM = "arboretum",
}

export enum CriticalityLevel {
  ALTA = "alta",
  MEDIA = "media",
  BAJA = "baja",
}
export enum TaskTypeEnum {
  PREVENTIVO = "mantenimiento preventivo",
  CORRECTIVO = "mantenimiento correctivo",
  INSPECCION = "inspeccion",
  OTRO = "otro",
}

export interface UserType {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  photoUrl: string;
  coordinates?: { lat: number; lng: number };
  // Añade cualquier otro campo que devuelva tu API de usuario
}

export interface ContractorType {
  _id: string;
  companyName: string;
  contactInfo: string;
  specialty: string;
  phone: string;
  photoUrl?: string; // Es opcional
}

export interface LocationType {
  _id: string;
  name: string;
  code: string;
  type: string; // Se mantiene como string para flexibilidad de la data que llega
  parentLocation?: LocationType; // Puede venir populada
  description?: string;
  coordinates?: { x: number; y: number };
}

export interface CommentType {
  _id: string;
  text: string;
  createdAt: string;
  author?: UserType;
}

export interface TaskType {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus; // <-- CAMBIO AQUÍ: Usamos el enum directamente
  criticality: CriticalityLevel; // <-- Usamos el enum directamente
  taskType: TaskTypeEnum; // <-- Usamos el enum directamente
  dueDate: string;
  location: LocationType;
  equipment?: EquipmentType;
  assignedTo?: UserType;
  contractorAssociated?: ContractorType;
  contractorContactName?: string;
  contractorContactPhone?: string;
  contractorNotes?: string;
  attachments: string[];
  comments: CommentType[];
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  statusHistory: {
    // <-- Añadimos el tipo para el historial
    from: TaskStatus;
    to: TaskStatus;
    reason: string;
    user: UserType;
    createdAt: string;
  }[];
  dailyLogs: DailyLogType[];
  requiredPpe?: PpeItemType[];
}

export enum TaskStatus {
  PENDIENTE = "pendiente",
  EN_PROGRESO = "en progreso",
  COMPLETADA = "completada",
  CANCELADA = "cancelada",
  PAUSADA = "pausada",
}

export enum UserRole {
  ADMIN = "admin",
  SUPERVISOR = "supervisor",
  PLANIFICADOR = "planificador",
  TECNICO = "tecnico",
  EHS = "ehs",
  SEGURIDAD_PATRIMONIAL = "seguridad_patrimonial",
}

export interface MapType {
  _id: string;
  name: string;
  imageUrl: string;
  crs: string;
  dimensions: { width: number; height: number };
  bounds: {
    lat: { min: number; max: number };
    lng: { min: number; max: number };
  };
  isActive: boolean;
}

export interface TaskTemplateType {
  _id: string;
  name: string;
  title: string;
  description: string;
  taskType:
    | "mantenimiento preventivo"
    | "mantenimiento correctivo"
    | "inspeccion"
    | "otro";
  criticality: "baja" | "media" | "alta";
  location?: LocationType;
  requiredPpe?: PpeItemType[];
}

export interface ActivityLogType {
  _id: string;
  user: {
    _id: string;
    name: string;
    photoUrl?: string;
  };
  action: string;
  task?: {
    _id: string;
    title: string;
  };
  details?: string;
  createdAt: string;
}

export enum EquipmentTypeEnum {
  INVERSOR = "inversor",
  SCB = "scb",
  STRING = "string",
  PANEL = "panel",
  WEATHER_STATION = "weather_station",
  SUBESTACION = "subestacion",
  TRANSFORMADOR = "transformador",
  TRACKER = "tracker",
  GENERADOR_EMERGENCIA = "generador_emergencia",
  GENERADOR_5KV = "generador_5kv",
  CELDA = "celda",
  CT = "ct",
  PT = "pt",
  SECCIONADOR = "seccionador",
  TRANSFORMADOR_AUXILIAR = "transformador_auxiliar",
  SKID = "skid",
  OTRO = "otro",
}

export interface EquipmentType {
  _id: string;
  name: string;
  code: string;
  type: EquipmentTypeEnum;
  location: LocationType;
  brand?: string;
  model?: string;
  installationDate?: string;
}

// --- NUEVO TIPO ---
export interface ScheduledTaskType {
  _id: string;
  name: string;
  taskTemplate: TaskTemplateType; // Viene populada desde el backend
  schedule: string;
  targetEquipmentType: string;
  isEnabled: boolean;
  lastRunAt?: string;
}

export interface DailyLogType {
  _id: string;
  confirmedBy: UserType;
  notes: string;
  location: LocationType;
  createdAt: string;
}

export interface PpeItemType {
  _id: string;
  name: string;
  description?: string;
}

export enum ActionType {
  TASK_CREATED = "TAREA_CREADA",
  TASK_UPDATED = "TAREA_MODIFICADA",
  TASK_DELETED = "TAREA_ELIMINADA",
  TASK_STATUS_CHANGED = "CAMBIO_ESTADO_TAREA",
  TASK_ASSIGNED = "TAREA_ASIGNADA",
  COMMENT_ADDED = "COMENTARIO_AÑADIDO",
  ATTACHMENT_ADDED = "ADJUNTO_AÑADIDO",
  USER_CREATED = "USUARIO_CREADO",
  USER_UPDATED = "USUARIO_MODIFICADO",
  USER_DELETED = "USUARIO_ELIMINADO",
  CONTRACTOR_CREATED = "CONTRATISTA_CREADO",
  CONTRACTOR_UPDATED = "CONTRATISTA_MODIFICADO",
  CONTRACTOR_DELETED = "CONTRATISTA_ELIMINADO",
  LOCATION_CREATED = "UBICACION_CREADA",
  LOCATION_UPDATED = "UBICACION_MODIFICADA",
  LOCATION_DELETED = "UBICACION_ELIMINADA",
  TEMPLATE_CREATED = "PLANTILLA_CREADA",
  TEMPLATE_UPDATED = "PLANTILLA_MODIFICADA",
  TEMPLATE_DELETED = "PLANTILLA_ELIMINADA",
  USER_LOGIN_SUCCESS = "INICIO_SESION_EXITOSO",
  USER_LOGIN_FAILED = "INICIO_SESION_FALLIDO",
}
