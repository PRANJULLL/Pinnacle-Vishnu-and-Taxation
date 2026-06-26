"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUSES, EMPLOYEES, PLAN_FILTERS, DATE_FILTERS } from "@/lib/constants";
import type { TaskFilters } from "@/lib/types";

interface TaskFiltersBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
}

export function TaskFiltersBar({ filters, onChange }: TaskFiltersBarProps) {
  const update = (key: keyof TaskFilters, value: string) => {
    onChange({ ...filters, [key]: value === "All" ? undefined : value, page: 1 });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <FilterSelect
        label="Status"
        value={filters.status || "All"}
        options={[...STATUSES]}
        onChange={(v) => update("status", v)}
      />
      <FilterSelect
        label="Employee"
        value={filters.employee || "All"}
        options={["All", ...EMPLOYEES]}
        onChange={(v) => update("employee", v)}
      />
      <FilterSelect
        label="Plan"
        value={filters.plan || "All"}
        options={[...PLAN_FILTERS]}
        onChange={(v) => update("plan", v)}
      />
      <FilterSelect
        label="Date"
        value={filters.dateFilter || "All"}
        options={[...DATE_FILTERS]}
        onChange={(v) => update("dateFilter", v)}
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}:</span>
      <Select value={value} onValueChange={(v) => v && onChange(v)}>
        <SelectTrigger className="h-8 w-[130px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt} className="text-xs">
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
