// src/components/activity-log/ActivityLogItem.tsx
"use client";
import { ActivityLogType } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
// import { cn } from "@/lib/utils";

export function ActivityLogItem({ log }: { log: ActivityLogType }) {
  return (
    <div className="flex items-start gap-4">
      <Avatar className="hidden h-9 w-9 sm:flex border">
        <AvatarImage src={log.user?.photoUrl} alt={log.user?.name} />
        <AvatarFallback>
          {log.user?.name?.substring(0, 2).toUpperCase() || "??"}
        </AvatarFallback>
      </Avatar>
      <div className="grid gap-1 text-sm">
        {/* --- LÍNEA MODIFICADA --- */}
        <p className="font-medium">
          <span className="font-bold">{log.user?.name || "Sistema"}</span>{" "}
          {log.details}
          {log.task && (
            <span className="text-muted-foreground">
              {" en la tarea "}
              <Link
                href={`/tasks/${log.task._id}`}
                className="font-semibold text-primary hover:underline"
              >
                &quot;{log.task.title}&quot;
              </Link>
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(log.createdAt), "dd 'de' MMMM, yyyy 'a las' HH:mm", {
            locale: es,
          })}
        </p>
      </div>
    </div>
  );
}
