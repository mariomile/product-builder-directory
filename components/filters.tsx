"use client";

import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { TYPES, PILLARS, LEVELS } from "@/lib/constants";

function FilterGroup({
  label,
  paramKey,
  options,
}: {
  label: string;
  paramKey: string;
  options: { value: string; label: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const activeValue = searchParams.get(paramKey);

  const handleFilter = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page"); // Reset to page 1 on any filter change
      if (activeValue === value) {
        params.delete(paramKey);
      } else {
        params.set(paramKey, value);
      }
      startTransition(() => {
        router.push(`/?${params.toString()}`);
      });
    },
    [router, searchParams, activeValue, paramKey]
  );

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <div className="flex gap-1.5 flex-wrap">
        {options.map((option) => (
          <Badge
            key={option.value}
            variant={activeValue === option.value ? "default" : "outline"}
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => handleFilter(option.value)}
          >
            {option.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const activeFilters = ["type", "pillar", "level", "free", "search"].filter(
    (key) => searchParams.has(key)
  );

  const clearAll = () => {
    startTransition(() => {
      router.push("/");
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <FilterGroup label="Type" paramKey="type" options={TYPES} />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <FilterGroup label="Pillar" paramKey="pillar" options={PILLARS} />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <FilterGroup label="Level" paramKey="level" options={LEVELS} />
        <FilterGroup
          label="Price"
          paramKey="free"
          options={[
            { value: "true", label: "Free" },
            { value: "false", label: "Paid" },
          ]}
        />
      </div>
      {activeFilters.length > 0 && (
        <button
          onClick={clearAll}
          className="text-xs text-muted-foreground hover:text-foreground underline self-start"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
