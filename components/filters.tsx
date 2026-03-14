"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { TYPES, PILLARS, LEVELS } from "@/lib/constants";

function FilterGroup({
  label,
  paramKey,
  options,
  description,
}: {
  label: string;
  paramKey: string;
  options: { value: string; label: string }[];
  description?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const activeValue = searchParams.get(paramKey);

  const handleFilter = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
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
            variant={activeValue === option.value ? "default" : "outline"}
            className="cursor-pointer hover:bg-accent transition-colors font-mono text-xs"
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

  const activeCount = ["type", "pillar", "level", "free"].filter((key) =>
    searchParams.has(key)
  ).length;

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    ["type", "pillar", "level", "free", "page"].forEach((k) =>
      params.delete(k)
    );
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <Dialog>
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
          <FilterGroup label="--type" paramKey="type" options={TYPES} description="Filter by content format" />
          <FilterGroup label="--pillar" paramKey="pillar" options={PILLARS} description="Filter by product discipline" />
          <div className="flex flex-col sm:flex-row gap-5">
            <FilterGroup label="--level" paramKey="level" options={LEVELS} description="Filter by experience level" />
            <FilterGroup
              label="--price"
              paramKey="free"
              description="Filter by pricing model"
              options={[
                { value: "true", label: "Free" },
                { value: "false", label: "Paid" },
              ]}
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
          <DialogClose asChild>
            <button className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors border border-border px-2 py-1 hover:border-foreground">
              [close]
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
