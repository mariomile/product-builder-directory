"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { TYPES, PILLARS, LEVELS } from "@/lib/constants";

function FilterGroup({
  label,
  description,
  options,
  activeValues,
  onToggle,
}: {
  label: string;
  description?: string;
  options: { value: string; label: string }[];
  activeValues: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className={`text-xs font-mono text-muted-foreground tracking-wider${description ? " man-tooltip" : ""}`}
        {...(description ? { "data-man": description } : {})}
      >
        {label}
      </span>
      <div className="flex gap-1.5 flex-wrap">
        {options.map((option) => (
          <Badge
            key={option.value}
            variant={activeValues.includes(option.value) ? "default" : "outline"}
            className="cursor-pointer hover:bg-accent transition-colors font-mono text-xs"
            onClick={() => onToggle(option.value)}
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
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Record<string, string[]>>({
    type: [],
    pillar: [],
    level: [],
    free: [],
  });
  const [applying, setApplying] = useState(false);

  const activeCount = ["type", "pillar", "level", "free"].filter((key) =>
    searchParams.has(key)
  ).length;

  // Close dialog when the apply transition completes
  useEffect(() => {
    if (applying && !isPending) {
      setOpen(false);
      setApplying(false);
    }
  }, [applying, isPending]);

  const handleOpenChange = (val: boolean) => {
    if (val) {
      setPending({
        type: searchParams.getAll("type"),
        pillar: searchParams.getAll("pillar"),
        level: searchParams.getAll("level"),
        free: searchParams.getAll("free"),
      });
    }
    setOpen(val);
  };

  const handleToggle = (paramKey: string, value: string, singleSelect = false) => {
    setPending((prev) => {
      const current = prev[paramKey] ?? [];
      if (singleSelect) {
        return { ...prev, [paramKey]: current.includes(value) ? [] : [value] };
      }
      return {
        ...prev,
        [paramKey]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    ["type", "pillar", "level", "free"].forEach((k) => params.delete(k));
    Object.entries(pending).forEach(([key, values]) => {
      values.forEach((v) => params.append(key, v));
    });
    setApplying(true);
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    ["type", "pillar", "level", "free", "page"].forEach((k) => params.delete(k));
    setPending({ type: [], pillar: [], level: [], free: [] });
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors self-start border border-border px-2 py-1 hover:border-foreground">
          {activeCount > 0 ? (
            <>
              [--filter{" "}
              <span className="text-primary">({activeCount})</span>]
            </>
          ) : (
            "[--filter]"
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xl rounded-none border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-xs font-mono text-muted-foreground font-normal">
            // filter resources
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          <FilterGroup
            label="--type"
            description="Filter by content format"
            options={TYPES}
            activeValues={pending.type ?? []}
            onToggle={(v) => handleToggle("type", v)}
          />
          <FilterGroup
            label="--pillar"
            description="Filter by product discipline"
            options={PILLARS}
            activeValues={pending.pillar ?? []}
            onToggle={(v) => handleToggle("pillar", v)}
          />
          <div className="flex flex-col sm:flex-row gap-5">
            <FilterGroup
              label="--level"
              description="Filter by experience level"
              options={LEVELS}
              activeValues={pending.level ?? []}
              onToggle={(v) => handleToggle("level", v)}
            />
            <FilterGroup
              label="--price"
              description="Filter by pricing model"
              options={[
                { value: "true", label: "Free" },
                { value: "false", label: "Paid" },
              ]}
              activeValues={pending.free ?? []}
              onToggle={(v) => handleToggle("free", v, true)}
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between items-center">
          {activeCount > 0 ? (
            <button
              onClick={clearAll}
              className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
            >
              [clear filters]
            </button>
          ) : (
            <span />
          )}
          <button
            onClick={applyFilters}
            disabled={isPending}
            className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors border border-border px-2 py-1 hover:border-foreground disabled:opacity-50 min-w-[60px] text-center"
          >
            {isPending ? (
              <span className="animate-pulse text-primary">...</span>
            ) : (
              "[apply]"
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
