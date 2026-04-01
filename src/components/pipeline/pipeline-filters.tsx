"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useFilters } from "@/lib/hooks/use-filters";
import { useState } from "react";
import type { Creator, ProcessTemplate, ProductType, User } from "@/lib/types/database";

export function PipelineFilters({
  creators,
  pipelineSteps,
  teamMembers,
  productTypes,
}: {
  creators: Creator[];
  pipelineSteps: ProcessTemplate[];
  teamMembers: User[];
  productTypes: ProductType[];
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
        value={filters.product_type ?? ""}
        onValueChange={(val) => setFilter("product_type", val || undefined)}
      >
        <SelectTrigger size="sm" className="w-[170px]">
          <SelectValue placeholder="Produkttyp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Alle Produkttypen</SelectItem>
          {productTypes.map((pt) => (
            <SelectItem key={pt.id} value={pt.id}>
              {pt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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

      <MultiSelect
        options={pipelineSteps.map((step) => ({
          value: step.step_name,
          label: step.step_label,
        }))}
        selected={filters.status ? filters.status.split(",") : []}
        onChange={(values) =>
          setFilter("status", values.length > 0 ? values.join(",") : undefined)
        }
        placeholder="Status"
      />

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
