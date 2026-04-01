"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { KanbanCard } from "./kanban-card";
import { cn } from "@/lib/utils";
import type { VideoProjectWithRelations } from "@/lib/types/database";

export function KanbanColumn({
  stepName,
  stepLabel,
  projects,
}: {
  stepName: string;
  stepLabel: string;
  projects: VideoProjectWithRelations[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stepName });

  return (
    <div
      className={cn(
        "flex h-full w-[280px] shrink-0 flex-col rounded-lg border bg-muted/30",
        isOver && "border-primary/50 bg-primary/5"
      )}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <span className="text-sm font-medium truncate">{stepLabel}</span>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
          {projects.length}
        </Badge>
      </div>
      <ScrollArea className="flex-1 p-2">
        <SortableContext
          items={projects.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div ref={setNodeRef} className="space-y-2 min-h-[40px]">
            {projects.map((project) => (
              <KanbanCard key={project.id} project={project} />
            ))}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  );
}
