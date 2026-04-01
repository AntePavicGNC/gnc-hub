"use client";

import { useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toggleTaskCompleted } from "@/lib/actions/task-actions";
import { cn } from "@/lib/utils";
import type { Task, User } from "@/lib/types/database";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TaskChecklist({
  tasks,
  teamMembers,
  currentStep,
}: {
  tasks: Task[];
  teamMembers: User[];
  currentStep: string;
}) {
  const memberMap = new Map(teamMembers.map((u) => [u.id, u]));

  // Group tasks by pipeline step
  const groupedTasks = tasks.reduce(
    (acc, task) => {
      const step = task.pipeline_step;
      if (!acc[step]) acc[step] = [];
      acc[step].push(task);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  // Show current step tasks first, then others
  const stepOrder = Object.keys(groupedTasks).sort((a, b) => {
    if (a === currentStep) return -1;
    if (b === currentStep) return 1;
    return 0;
  });

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        Keine Aufgaben vorhanden.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {stepOrder.map((step) => (
        <div key={step}>
          <p
            className={cn(
              "text-xs font-medium mb-1.5",
              step === currentStep ? "text-primary" : "text-muted-foreground"
            )}
          >
            {step === currentStep ? "Aktuelle Stufe" : step}
          </p>
          <div className="space-y-1">
            {groupedTasks[step].map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                assignee={task.assigned_to ? memberMap.get(task.assigned_to) : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskItem({ task, assignee }: { task: Task; assignee?: User }) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(() => {
      toggleTaskCompleted(task.id, !task.is_completed);
    });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-opacity",
        isPending && "opacity-50"
      )}
    >
      <Checkbox
        checked={task.is_completed}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
      <span
        className={cn(
          "flex-1 text-sm",
          task.is_completed && "line-through text-muted-foreground"
        )}
      >
        {task.title}
      </span>
      {task.estimated_minutes ? (
        <span className="text-xs text-muted-foreground shrink-0">
          {task.estimated_minutes}min
        </span>
      ) : null}
      {assignee && (
        <Tooltip>
          <TooltipTrigger>
            <Avatar className="h-5 w-5">
              <AvatarImage src={assignee.avatar_url ?? undefined} alt={assignee.name} />
              <AvatarFallback className="text-[8px]">
                {getInitials(assignee.name)}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>{assignee.name}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
