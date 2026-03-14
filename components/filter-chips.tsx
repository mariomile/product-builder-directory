"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TYPE_LABELS, PILLAR_LABELS } from "@/lib/constants";

const CHIP_KEYS = ["type", "pillar", "level", "free"] as const;

function getChipLabel(key: string, value: string): string {
  if (key === "type") return `--type=${TYPE_LABELS[value] ?? value}`;
  if (key === "pillar") return `--pillar=${PILLAR_LABELS[value] ?? value}`;
  if (key === "level") return `--level=${value}`;
  if (key === "free") return `--price=${value === "true" ? "free" : "paid"}`;
  return `--${key}=${value}`;
}

export function FilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeChips = CHIP_KEYS.flatMap((key) => {
    const value = searchParams.get(key);
    return value ? [{ key, value }] : [];
  });

  if (activeChips.length === 0) return null;

  const removeChip = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    router.push(`/?${params.toString()}`);
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    [...CHIP_KEYS, "page"].forEach((k) => params.delete(k));
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {activeChips.map(({ key, value }) => (
        <span
          key={key}
          className="border border-primary/40 text-primary text-xs font-mono px-2 py-0.5 flex items-center gap-1.5"
        >
          {getChipLabel(key, value)}
          <button
            onClick={() => removeChip(key)}
            className="text-muted-foreground hover:text-foreground transition-colors leading-none"
            aria-label={`Remove ${key} filter`}
          >
            ✕
          </button>
        </span>
      ))}
      <button
        onClick={clearAll}
        className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
      >
        [clear all]
      </button>
    </div>
  );
}
