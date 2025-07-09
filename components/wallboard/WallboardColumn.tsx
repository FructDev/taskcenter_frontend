// src/components/wallboard/WallboardColumn.tsx
"use client";
import { TaskType } from "@/types";
import { WallboardTaskCard } from "./WallboardTaskCard";

interface WallboardColumnProps {
  title: string;
  tasks: TaskType[];
}

export function WallboardColumn({ title, tasks }: WallboardColumnProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-muted/40 p-4 h-[calc(100vh-200px)]">
      <h2 className="text-xl font-bold text-center pb-2 border-b">
        {title} <span className="font-light text-base">({tasks.length})</span>
      </h2>
      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {tasks.map((task) => (
          <WallboardTaskCard key={task._id} task={task} />
        ))}
      </div>
    </div>
  );
}
