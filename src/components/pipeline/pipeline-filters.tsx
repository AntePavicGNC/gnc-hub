"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useFilters } from "@/lib/hooks/use-filters";
import { useState } from "react";
import type { Creator, ProcessTemplate, User } from "@/lib/types/database";

export function PipelineFilters({
  creators,
  pipelineSteps,
  teamMembers,
}: {
  creators: Creator[];
  pipelineSteps: ProcessTemplate[];
  teamMembers: User[];
}) {
  const { filters, setFilter, clearFilters, hasActiveFilters } = useFilters();
  const [searchInput, setSearchInput] = useState(filters.search ?? "");

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFilter("search", searchInput || undefined);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Suchen..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-8 w-[180px] pl-8 text-sm"
        />
      </form>

      <Select
        value={filters.creator ?? ""}
        onValueChange={(val) => setFilter("creator", val || undefined)}
      >
        <SelectTrigger size="sm" className="w-[130px]">
          <SelectValue placeholder="Creator" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Alle Creator</SelectItem>
          {creators.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: c.color }}
              />
              {c.short_code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status ?? ""}
        onValueChange={(val) => setFilter("status", val || undefined)}
      >
        <SelectTrigger size="sm" className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Alle Status</SelectItem>
          {pipelineSteps.map((step) => (
            <SelectItem key={step.step_name} value={step.step_name}>
              {step.step_label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority ?? ""}
        onValueChange={(val) => setFilter("priority", val || undefined)}
      >
        <SelectTrigger size="sm" className="w-[120px]">
          <SelectValue placeholder="Priorität" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Alle Prio</SelectItem>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
            <SelectItem key={p} value={String(p)}>
              Prio {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.assignee ?? ""}
        onValueChange={(val) => setFilter("assignee", val || undefined)}
      >
        <SelectTrigger size="sm" className="w-[160px]">
          <SelectValue placeholder="Zugewiesen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Alle Personen</SelectItem>
          {teamMembers.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-7 gap-1 text-xs text-muted-foreground"
        >
          <X className="h-3 w-3" />
          Filter zurücksetzen
        </Button>
      )}
    </div>
  );
}
