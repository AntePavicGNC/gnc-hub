"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { updateProjectStatus } from "@/lib/actions/project-actions";
import { Check } from "lucide-react";
import type { ProcessTemplate } from "@/lib/types/database";

export function StatusStepper({
  projectId,
  currentStatus,
  steps,
}: {
  projectId: string;
  currentStatus: string;
  steps: ProcessTemplate[];
}) {
  const [isPending, startTransition] = useTransition();
  const currentIndex = steps.findIndex((s) => s.step_name === currentStatus);

  function handleStepClick(stepName: string) {
    startTransition(() => {
      updateProjectStatus(projectId, stepName);
    });
  }

  return (
    <div className={cn("space-y-1", isPending && "opacity-50 pointer-events-none")}>
      <p className="text-xs font-medium text-muted-foreground mb-2">Pipeline-Fortschritt</p>
      <div className="space-y-0.5">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <button
              key={step.step_name}
              onClick={() => handleStepClick(step.step_name)}
              className={cn(
                "flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
                isCompleted && "text-muted-foreground",
                isCurrent && "bg-primary/10 text-primary font-medium",
                !isCompleted && !isCurrent && "text-muted-foreground/60 hover:bg-muted"
              )}
            >
              <div
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                  isCompleted && "bg-primary/20 text-primary",
                  isCurrent && "bg-primary text-primary-foreground",
                  !isCompleted && !isCurrent && "border border-muted-foreground/30 text-muted-foreground/50"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3" />
                ) : (
                  step.step_order
                )}
              </div>
              <span className="truncate">{step.step_label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
