"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PauseCircle, AlertTriangle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VideoProjectWithRelations } from "@/lib/types/database";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function KanbanCard({ project }: { project: VideoProjectWithRelations }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id, data: { project } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const nextDeadline = project.desired_post_date ?? project.latest_post_date;
  const isOverdue =
    nextDeadline && new Date(nextDeadline) < new Date() && project.status !== "completed";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "rounded-lg border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md",
        isDragging && "opacity-50 shadow-lg",
        project.is_on_hold && "opacity-60 border-amber-300 bg-amber-50/30",
        project.is_rejected && "opacity-60 border-destructive/30 bg-destructive/5"
      )}
    >
      <div className="space-y-2">
        {/* Header: Customer + flags */}
        <div className="flex items-start justify-between gap-1">
          <Link
            href={`/pipeline/${project.id}`}
            className="text-sm font-medium leading-tight hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {project.customer.name}
          </Link>
          <div className="flex items-center gap-0.5 shrink-0">
            {project.is_on_hold && (
              <PauseCircle className="h-3.5 w-3.5 text-amber-500" />
            )}
            {project.is_rejected && (
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            )}
          </div>
        </div>

        {/* Creator Badge + Priority */}
        <div className="flex items-center gap-1.5">
          {project.creator && (
            <Badge
              variant="secondary"
              className="text-[10px] font-semibold border px-1.5 py-0"
              style={{
                backgroundColor: `${project.creator.color}15`,
                borderColor: `${project.creator.color}40`,
                color: project.creator.color,
              }}
            >
              {project.creator.short_code}
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            P{project.priority}
          </Badge>
          {project.video_count > 1 && (
            <span className="text-[10px] text-muted-foreground">
              {project.video_count} Videos
            </span>
          )}
        </div>

        {/* Deadline */}
        {nextDeadline && (
          <div
            className={cn(
              "flex items-center gap-1 text-[10px]",
              isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
            )}
          >
            <Calendar className="h-3 w-3" />
            {formatDate(nextDeadline)}
          </div>
        )}

        {/* Assigned avatars */}
        <div className="flex items-center gap-1 pt-0.5">
          {[project.cutter, project.scripter, project.sm_manager]
            .filter(Boolean)
            .map((user) => (
              <Tooltip key={user!.id}>
                <TooltipTrigger>
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src={user!.avatar_url ?? undefined}
                      alt={user!.name}
                    />
                    <AvatarFallback className="text-[8px]">
                      {getInitials(user!.name)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>{user!.name}</TooltipContent>
              </Tooltip>
            ))}
        </div>
      </div>
    </div>
  );
}
