"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, RefreshCw } from "lucide-react";
import {
  generatePostingSlots,
  updatePostingSlotDate,
  updatePostingSlotStatus,
} from "@/lib/actions/posting-actions";
import type { Database } from "@/lib/types/database";

type PostingSlot = Database["public"]["Tables"]["posting_slots"]["Row"];

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  planned: { label: "Geplant", className: "bg-blue-100 text-blue-800 border-blue-200" },
  posted: { label: "Gepostet", className: "bg-green-100 text-green-800 border-green-200" },
  skipped: { label: "Übersprungen", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

export function PostingSchedule({
  projectId,
  slots,
  hasPostingPeriod,
}: {
  projectId: string;
  slots: PostingSlot[];
  hasPostingPeriod: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      await generatePostingSlots(projectId);
    });
  }

  function handleDateChange(slotId: string, date: string) {
    startTransition(async () => {
      await updatePostingSlotDate(slotId, date, projectId);
    });
  }

  function handleStatusToggle(slot: PostingSlot) {
    const next = slot.status === "planned" ? "posted" : slot.status === "posted" ? "skipped" : "planned";
    startTransition(async () => {
      await updatePostingSlotStatus(slot.id, next, projectId);
    });
  }

  return (
    <div className={`space-y-3 ${isPending ? "opacity-70" : ""}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          Posting-Plan
        </h4>
        {hasPostingPeriod && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={isPending}
            className="h-7 text-xs gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            {slots.length > 0 ? "Neu generieren" : "Generieren"}
          </Button>
        )}
      </div>

      {!hasPostingPeriod && (
        <p className="text-xs text-muted-foreground">
          Posting-Zeitraum setzen, um Slots zu generieren.
        </p>
      )}

      {slots.length > 0 && (
        <div className="space-y-1.5">
          {slots.map((slot) => {
            const statusInfo = STATUS_LABELS[slot.status] ?? STATUS_LABELS.planned;
            return (
              <div
                key={slot.id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50"
              >
                <span className="text-xs text-muted-foreground w-6 shrink-0">
                  #{slot.video_number}
                </span>
                <Input
                  type="date"
                  defaultValue={slot.scheduled_date}
                  onBlur={(e) => {
                    if (e.target.value && e.target.value !== slot.scheduled_date) {
                      handleDateChange(slot.id, e.target.value);
                    }
                  }}
                  className="h-7 w-36 text-xs"
                />
                <button
                  onClick={() => handleStatusToggle(slot)}
                  className="cursor-pointer"
                >
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${statusInfo.className}`}
                  >
                    {statusInfo.label}
                  </Badge>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
