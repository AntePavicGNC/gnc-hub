"use client";

import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink, PauseCircle, AlertTriangle } from "lucide-react";
import { updateProjectField, toggleProjectHold, toggleProjectRejected } from "@/lib/actions/project-actions";
import type { VideoProjectWithRelations, Creator, User } from "@/lib/types/database";

function InlineField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function ProjectForm({
  project,
  creators,
  teamMembers,
}: {
  project: VideoProjectWithRelations;
  creators: Creator[];
  teamMembers: User[];
}) {
  const [isPending, startTransition] = useTransition();

  function handleFieldChange(
    field: string,
    value: string | number | boolean | null
  ) {
    startTransition(() => {
      updateProjectField(project.id, field as any, value);
    });
  }

  return (
    <div className={isPending ? "opacity-70 pointer-events-none" : ""}>
      <div className="space-y-3">
        {/* Customer & Title */}
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-heading text-lg font-bold">
            {project.customer.name}
          </h3>
          {project.creator && (
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
          )}
        </div>

        {/* Flags */}
        <div className="flex gap-4 pb-2 border-b">
          <div className="flex items-center gap-2">
            <PauseCircle className="h-4 w-4 text-amber-500" />
            <Label className="text-sm">On Hold</Label>
            <Switch
              checked={project.is_on_hold}
              onCheckedChange={(val) => toggleProjectHold(project.id, val)}
            />
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <Label className="text-sm">Abgelehnt</Label>
            <Switch
              checked={project.is_rejected}
              onCheckedChange={(val) => toggleProjectRejected(project.id, val)}
            />
          </div>
        </div>

        {/* Title */}
        <InlineField label="Titel">
          <Input
            defaultValue={project.title ?? ""}
            placeholder="Projekttitel..."
            onBlur={(e) =>
              handleFieldChange("title", e.target.value || null)
            }
          />
        </InlineField>

        {/* Creator */}
        <InlineField label="Creator">
          <Select
            value={project.creator_id ?? ""}
            onValueChange={(val) =>
              handleFieldChange("creator_id", val || null)
            }
          >
            <SelectTrigger size="sm">
              <SelectValue placeholder="Creator wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Kein Creator</SelectItem>
              {creators.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ({c.short_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </InlineField>

        {/* Video Count */}
        <InlineField label="Videos">
          <Input
            type="number"
            min={1}
            defaultValue={project.video_count}
            onBlur={(e) =>
              handleFieldChange("video_count", parseInt(e.target.value) || 1)
            }
            className="w-20"
          />
        </InlineField>

        {/* Location */}
        <InlineField label="Ort">
          <Select
            value={project.location}
            onValueChange={(val) => handleFieldChange("location", val)}
          >
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="on_site">Vor Ort</SelectItem>
            </SelectContent>
          </Select>
        </InlineField>

        {/* Dates */}
        <InlineField label="Script-Deadline">
          <Input
            type="date"
            defaultValue={project.script_deadline ?? ""}
            onBlur={(e) =>
              handleFieldChange("script_deadline", e.target.value || null)
            }
            className="w-40"
          />
        </InlineField>

        <InlineField label="Wunschdatum">
          <Input
            type="date"
            defaultValue={project.desired_post_date ?? ""}
            onBlur={(e) =>
              handleFieldChange("desired_post_date", e.target.value || null)
            }
            className="w-40"
          />
        </InlineField>

        <InlineField label="Spätestens">
          <Input
            type="date"
            defaultValue={project.latest_post_date ?? ""}
            onBlur={(e) =>
              handleFieldChange("latest_post_date", e.target.value || null)
            }
            className="w-40"
          />
        </InlineField>

        <InlineField label="Drehdatum">
          <Input
            type="date"
            defaultValue={project.shoot_date ?? ""}
            onBlur={(e) =>
              handleFieldChange("shoot_date", e.target.value || null)
            }
            className="w-40"
          />
        </InlineField>

        {/* Posting Period */}
        <InlineField label="Posting von">
          <Input
            type="date"
            defaultValue={project.posting_period_start ?? ""}
            onBlur={(e) =>
              handleFieldChange("posting_period_start", e.target.value || null)
            }
            className="w-40"
          />
        </InlineField>

        <InlineField label="Posting bis">
          <Input
            type="date"
            defaultValue={project.posting_period_end ?? ""}
            onBlur={(e) =>
              handleFieldChange("posting_period_end", e.target.value || null)
            }
            className="w-40"
          />
        </InlineField>

        {/* Assigned Users */}
        <div className="pt-2 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Zuweisungen
          </p>
        </div>

        <InlineField label="Cutter">
          <Select
            value={project.assigned_cutter ?? ""}
            onValueChange={(val) =>
              handleFieldChange("assigned_cutter", val || null)
            }
          >
            <SelectTrigger size="sm">
              <SelectValue placeholder="Nicht zugewiesen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nicht zugewiesen</SelectItem>
              {teamMembers.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </InlineField>

        <InlineField label="Scripter">
          <Select
            value={project.assigned_scripter ?? ""}
            onValueChange={(val) =>
              handleFieldChange("assigned_scripter", val || null)
            }
          >
            <SelectTrigger size="sm">
              <SelectValue placeholder="Nicht zugewiesen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nicht zugewiesen</SelectItem>
              {teamMembers.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </InlineField>

        <InlineField label="SM Manager">
          <Select
            value={project.assigned_sm_manager ?? ""}
            onValueChange={(val) =>
              handleFieldChange("assigned_sm_manager", val || null)
            }
          >
            <SelectTrigger size="sm">
              <SelectValue placeholder="Nicht zugewiesen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nicht zugewiesen</SelectItem>
              {teamMembers.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </InlineField>

        {/* Links */}
        <div className="pt-2 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Links
          </p>
        </div>

        <InlineField label="Skript-URL">
          <div className="flex items-center gap-1.5">
            <Input
              defaultValue={project.script_url ?? ""}
              placeholder="https://..."
              onBlur={(e) =>
                handleFieldChange("script_url", e.target.value || null)
              }
            />
            {project.script_url && (
              <a href={project.script_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </a>
            )}
          </div>
        </InlineField>

        <InlineField label="Drive-Link">
          <div className="flex items-center gap-1.5">
            <Input
              defaultValue={project.drive_link ?? ""}
              placeholder="https://..."
              onBlur={(e) =>
                handleFieldChange("drive_link", e.target.value || null)
              }
            />
            {project.drive_link && (
              <a href={project.drive_link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </a>
            )}
          </div>
        </InlineField>

        {/* Notes */}
        <div className="pt-2 border-t">
          <Label className="text-sm text-muted-foreground">Notizen</Label>
          <Textarea
            defaultValue={project.notes ?? ""}
            placeholder="Projektnotizen..."
            rows={3}
            className="mt-1.5"
            onBlur={(e) =>
              handleFieldChange("notes", e.target.value || null)
            }
          />
        </div>
      </div>
    </div>
  );
}
