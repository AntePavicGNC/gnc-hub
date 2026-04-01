"use client";

import { useTransition, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { updateProjectStatus } from "@/lib/actions/project-actions";
import type { VideoProjectWithRelations, ProcessTemplate } from "@/lib/types/database";

export function KanbanBoard({
  projects,
  pipelineSteps,
}: {
  projects: VideoProjectWithRelations[];
  pipelineSteps: ProcessTemplate[];
}) {
  const [activeProject, setActiveProject] =
    useState<VideoProjectWithRelations | null>(null);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Group projects by status
  const projectsByStatus = useMemo(() => {
    const map = new Map<string, VideoProjectWithRelations[]>();
    for (const step of pipelineSteps) {
      map.set(step.step_name, []);
    }
    for (const project of projects) {
      const list = map.get(project.status);
      if (list) {
        list.push(project);
      }
    }
    return map;
  }, [projects, pipelineSteps]);

  function handleDragStart(event: DragStartEvent) {
    const project = (event.active.data.current as any)?.project as
      | VideoProjectWithRelations
      | undefined;
    setActiveProject(project ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveProject(null);

    const { active, over } = event;
    if (!over) return;

    const projectId = active.id as string;
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    // Determine target column — over.id could be a column id or another card's id
    let targetStatus: string;
    const overProject = projects.find((p) => p.id === over.id);
    if (overProject) {
      targetStatus = overProject.status;
    } else {
      targetStatus = over.id as string;
    }

    if (targetStatus === project.status) return;

    startTransition(() => {
      updateProjectStatus(projectId, targetStatus);
    });
  }

  return (
    <div className={isPending ? "opacity-70 pointer-events-none" : ""}>
      <ScrollArea className="w-full">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 pb-4" style={{ minHeight: "calc(100vh - 280px)" }}>
            {pipelineSteps.map((step) => (
              <KanbanColumn
                key={step.step_name}
                stepName={step.step_name}
                stepLabel={step.step_label}
                projects={projectsByStatus.get(step.step_name) ?? []}
              />
            ))}
          </div>
          <DragOverlay>
            {activeProject && <KanbanCard project={activeProject} />}
          </DragOverlay>
        </DndContext>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
