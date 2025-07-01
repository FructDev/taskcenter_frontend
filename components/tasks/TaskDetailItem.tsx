// src/components/tasks/TaskDetailItem.tsx
import { cn } from "@/lib/utils";
import React from "react";

interface TaskDetailItemProps {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function TaskDetailItem({
  icon: Icon,
  label,
  children,
  className,
}: TaskDetailItemProps) {
  return (
    <div className={cn("grid grid-cols-2 items-start gap-4", className)}>
      <div className="flex items-center text-sm text-muted-foreground">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span className="text-muted-foreground">{label}</span>
      </div>
      <div className="text-sm font-medium text-right break-words">
        {children}
      </div>
    </div>
  );
}
