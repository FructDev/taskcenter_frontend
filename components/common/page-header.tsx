// src/components/common/page-header.tsx
import React from "react";
import { Separator } from "@/components/ui/separator";

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  actionButton?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  actionButton,
}: PageHeaderProps) {
  return (
    <>
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actionButton && (
          <div className="flex gap-2 shrink-0">{actionButton}</div>
        )}
      </header>
      <Separator />
    </>
  );
}
