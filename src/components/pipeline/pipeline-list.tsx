"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PauseCircle, AlertTriangle } from "lucide-react";
import type { VideoProjectWithRelations, ProcessTemplate } from "@/lib/types/database";

const PRIORITY_LABELS: Record<number, { label: string; className: string }> = {
  1: { label: "1", className: "bg-red-100 text-red-800 border-red-200" },
  2: { label: "2", className: "bg-orange-100 text-orange-800 border-orange-200" },
  3: { label: "3", className: "bg-amber-100 text-amber-800 border-amber-200" },
  4: { label: "4", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  5: { label: "5", className: "bg-lime-100 text-lime-800 border-lime-200" },
  6: { label: "6", className: "bg-green-100 text-green-800 border-green-200" },
  7: { label: "7", className: "bg-teal-100 text-teal-800 border-teal-200" },
  8: { label: "8", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function UserAvatar({
  user,
}: {
  user: { id: string; name: string; avatar_url: string | null } | null;
}) {
  if (!user) return <span className="text-muted-foreground">—</span>;
  return (
    <Tooltip>
      <TooltipTrigger>
        <Avatar className="h-6 w-6">
          <AvatarImage src={user.avatar_url ?? undefined} alt={user.name} />
          <AvatarFallback className="text-[10px]">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent>{user.name}</TooltipContent>
    </Tooltip>
  );
}

export function PipelineList({
  projects,
  pipelineSteps,
}: {
  projects: VideoProjectWithRelations[];
  pipelineSteps: ProcessTemplate[];
}) {
  const stepLabelMap = new Map(
    pipelineSteps.map((s) => [s.step_name, s.step_label])
  );

  if (projects.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Keine Projekte gefunden.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[140px]">Status</TableHead>
          <TableHead>Kunde</TableHead>
          <TableHead>Creator</TableHead>
          <TableHead className="text-center">Videos</TableHead>
          <TableHead className="text-center">Prio</TableHead>
          <TableHead>Wunsch</TableHead>
          <TableHead>Spätestens</TableHead>
          <TableHead>Dreh</TableHead>
          <TableHead className="text-center">Cutter</TableHead>
          <TableHead className="text-center">Scripter</TableHead>
          <TableHead className="text-center">SM</TableHead>
          <TableHead>Notizen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => {
          const priority = PRIORITY_LABELS[project.priority] ?? PRIORITY_LABELS[8];
          const statusLabel = stepLabelMap.get(project.status) ?? project.status;

          return (
            <TableRow
              key={project.id}
              className={
                project.is_on_hold
                  ? "opacity-60 bg-muted/30"
                  : project.is_rejected
                    ? "opacity-60 bg-destructive/5"
                    : ""
              }
            >
              <TableCell>
                <Link
                  href={`/pipeline/${project.id}`}
                  className="flex items-center gap-1.5 hover:underline"
                >
                  {project.is_on_hold && (
                    <PauseCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  )}
                  {project.is_rejected && (
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                  )}
                  <Badge variant="outline" className="text-xs font-normal">
                    {statusLabel}
                  </Badge>
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/pipeline/${project.id}`}
                  className="font-medium hover:underline"
                >
                  {project.customer.name}
                </Link>
                {project.title && (
                  <span className="ml-1.5 text-muted-foreground text-xs">
                    {project.title}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {project.creator ? (
                  <Badge
                    variant="secondary"
                    className="text-xs font-semibold border"
                    style={{
                      backgroundColor: `${project.creator.color}15`,
                      borderColor: `${project.creator.color}40`,
                      color: project.creator.color,
                    }}
                  >
                    {project.creator.short_code}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-center">{project.video_count}</TableCell>
              <TableCell className="text-center">
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold ${priority.className}`}
                >
                  {priority.label}
                </Badge>
              </TableCell>
              <TableCell className="text-xs">
                {formatDate(project.desired_post_date)}
              </TableCell>
              <TableCell className="text-xs">
                {formatDate(project.latest_post_date)}
              </TableCell>
              <TableCell className="text-xs">
                {formatDate(project.shoot_date)}
              </TableCell>
              <TableCell className="text-center">
                <UserAvatar user={project.cutter} />
              </TableCell>
              <TableCell className="text-center">
                <UserAvatar user={project.scripter} />
              </TableCell>
              <TableCell className="text-center">
                <UserAvatar user={project.sm_manager} />
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                {project.notes ?? "—"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
