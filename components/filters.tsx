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
import { useState, useEffect } from "react";
import { TYPES, PILLARS, LEVELS } from "@/lib/constants";
import { getFilteredCountClient } from "@/lib/client-queries";

type PendingFilters = {
  type: string | null;
  pillar: string | null;
  level: string | null;
  free: string | null;
};

function FilterGroup({
  label,
  options,
  description,
  value,
  onChange,
}: {
  label: string;
  paramKey: string;
  options: { value: string; label: string }[];
  description?: string;
  value: string | null;
  onChange: (v: string | null) => void;
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
            variant={value === option.value ? "default" : "outline"}
            className="cursor-pointer hover:bg-accent transition-colors font-mono text-xs"
            onClick={() => onChange(value === option.value ? null : option.value)}
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
  const [open, setOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<PendingFilters>({
    type: null,
    pillar: null,
    level: null,
    free: null,
  });
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);

  const activeCount = ["type", "pillar", "level", "free"].filter((key) =>
    searchParams.has(key)
  ).length;

  const search = searchParams.get("search") ?? undefined;

  // Sync pending state from URL when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setPendingFilters({
        type: searchParams.get("type"),
        pillar: searchParams.get("pillar"),
        level: searchParams.get("level"),
        free: searchParams.get("free"),
      });
      setPendingCount(null);
    }
    setOpen(isOpen);
  };

  // Debounced live count while dialog is open
  useEffect(() => {
    if (!open) return;
    setCountLoading(true);
    const timer = setTimeout(async () => {
      const count = await getFilteredCountClient({
        search,
        ...pendingFilters,
      });
      setPendingCount(count);
      setCountLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [open, pendingFilters, search]);

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    ["type", "pillar", "level", "free", "page"].forEach((k) => params.delete(k));
    if (pendingFilters.type) params.set("type", pendingFilters.type);
    if (pendingFilters.pillar) params.set("pillar", pendingFilters.pillar);
    if (pendingFilters.level) params.set("level", pendingFilters.level);
    if (pendingFilters.free) params.set("free", pendingFilters.free);
    router.push(`/?${params.toString()}`);
    setOpen(false);
  };

  const clearPending = () => {
    setPendingFilters({ type: null, pillar: null, level: null, free: null });
  };

  const pendingActiveCount = Object.values(pendingFilters).filter(Boolean).length;

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
            paramKey="type"
            options={TYPES}
            description="Filter by content format"
            value={pendingFilters.type}
            onChange={(v) => setPendingFilters((p) => ({ ...p, type: v }))}
          />
          <FilterGroup
            label="--pillar"
            paramKey="pillar"
            options={PILLARS}
            description="Filter by product discipline"
            value={pendingFilters.pillar}
            onChange={(v) => setPendingFilters((p) => ({ ...p, pillar: v }))}
          />
          <div className="flex flex-col sm:flex-row gap-5">
            <FilterGroup
              label="--level"
              paramKey="level"
              options={LEVELS}
              description="Filter by experience level"
              value={pendingFilters.level}
              onChange={(v) => setPendingFilters((p) => ({ ...p, level: v }))}
            />
            <FilterGroup
              label="--price"
              paramKey="free"
              description="Filter by pricing model"
              options={[
                { value: "true", label: "Free" },
                { value: "false", label: "Paid" },
              ]}
              value={pendingFilters.free}
              onChange={(v) => setPendingFilters((p) => ({ ...p, free: v }))}
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between items-center">
          {pendingActiveCount > 0 ? (
            <button
              onClick={clearPending}
              className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
            >
              [clear filters]
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(false)}
              className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors border border-border px-2 py-1 hover:border-foreground"
            >
              [cancel]
            </button>
            <button
              onClick={handleApply}
              className="text-xs font-mono text-foreground hover:text-primary transition-colors border border-foreground hover:border-primary px-2 py-1"
            >
              {countLoading || pendingCount === null
                ? "[apply...]"
                : `[apply — ${pendingCount} results]`}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
