"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { TodoFilters as Filters } from "@/types";
import { Search, X } from "lucide-react";
import { useCallback } from "react";

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

const COMPLETED_OPTIONS = [
  { label: "All", value: undefined },
  { label: "Active", value: false },
  { label: "Done", value: true },
] as const;

const PRIORITY_OPTIONS = [
  { label: "Any priority", value: undefined },
  { label: "High", value: "HIGH" as const },
  { label: "Medium", value: "MEDIUM" as const },
  { label: "Low", value: "LOW" as const },
];

export function TodoFilters({ filters, onChange }: Props) {
  const set = useCallback(
    (patch: Partial<Filters>) => onChange({ ...filters, ...patch }),
    [filters, onChange]
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search todos..."
          value={filters.search ?? ""}
          onChange={(e) => set({ search: e.target.value || undefined })}
          className="pl-9 pr-9"
          aria-label="Search todos"
        />
        {filters.search && (
          <button
            onClick={() => set({ search: undefined })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {COMPLETED_OPTIONS.map((opt) => (
          <Button
            key={String(opt.value)}
            variant={filters.completed === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() => set({ completed: opt.value })}
          >
            {opt.label}
          </Button>
        ))}

        <div className="w-px bg-border mx-1" />

        {PRIORITY_OPTIONS.map((opt) => (
          <Button
            key={String(opt.value)}
            variant={filters.priority === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() => set({ priority: opt.value })}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
