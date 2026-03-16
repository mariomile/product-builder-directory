"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { TYPES, PILLARS, LEVELS } from "@/lib/constants";

const FILTER_CATEGORIES = [
  { key: "type", label: "--type", options: TYPES },
  { key: "pillar", label: "--pillar", options: PILLARS },
  { key: "level", label: "--level", options: LEVELS },
  {
    key: "free",
    label: "--price",
    options: [
      { value: "true", label: "Free" },
      { value: "false", label: "Paid" },
    ],
  },
] as const;

function getActiveValues(searchParams: URLSearchParams, key: string): string[] {
  return searchParams.getAll(key);
}

export function InlineFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (key: string) => {
    setExpandedCategory((prev) => (prev === key ? null : key));
  };

  const toggleFilter = (paramKey: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    const isSingleSelect = paramKey === "free";
    const current = params.getAll(paramKey);

    if (isSingleSelect) {
      params.delete(paramKey);
      if (!current.includes(value)) {
        params.set(paramKey, value);
      }
    } else {
      if (current.includes(value)) {
        params.delete(paramKey);
        current.filter((v) => v !== value).forEach((v) => params.append(paramKey, v));
      } else {
        params.append(paramKey, value);
      }
    }

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    ["type", "pillar", "level", "free", "page"].forEach((k) => params.delete(k));
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  const hasAnyFilter = FILTER_CATEGORIES.some(
    (cat) => getActiveValues(searchParams, cat.key).length > 0
  );

  return (
    <div className="flex flex-col gap-0">
      {/* Category row */}
      <div className="flex gap-2 items-center flex-wrap">
        {FILTER_CATEGORIES.map((cat) => {
          const active = getActiveValues(searchParams, cat.key);
          const isExpanded = expandedCategory === cat.key;
          const hasActive = active.length > 0;

          return (
            <button
              key={cat.key}
              onClick={() => toggleCategory(cat.key)}
              className={`text-xs font-mono px-2 py-1 border transition-colors ${
                hasActive
                  ? "border-primary/40 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
              }`}
            >
              {cat.label}
              {hasActive && (
                <span className="opacity-60 ml-1">({active.length})</span>
              )}
              {isExpanded && <span className="ml-1 opacity-60">▾</span>}
            </button>
          );
        })}

        {hasAnyFilter && (
          <button
            onClick={clearAll}
            className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors ml-auto"
          >
            [clear]
          </button>
        )}
      </div>

      {/* Expanded options panel */}
      {expandedCategory && (
        <div className="mt-2 pl-2 border-l-2 border-primary/30 flex gap-1.5 flex-wrap py-2">
          {FILTER_CATEGORIES.find((c) => c.key === expandedCategory)?.options.map(
            (option) => {
              const isActive = getActiveValues(
                searchParams,
                expandedCategory
              ).includes(option.value);

              return (
                <button
                  key={option.value}
                  onClick={() => toggleFilter(expandedCategory, option.value)}
                  className={`text-xs font-mono px-2 py-0.5 border transition-colors ${
                    isActive
                      ? "border-primary/50 text-primary bg-primary/[0.08]"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                  }`}
                >
                  {option.label}
                </button>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}
