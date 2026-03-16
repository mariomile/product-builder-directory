# Inline Accordion Filters Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the modal-based filter system with inline accordion category chips that toggle filters instantly via URL params.

**Architecture:** A single `<InlineFilters>` client component replaces `<Filters>`, `<FilterChips>`, and the Dialog dependency. Four category buttons (`--type`, `--pillar`, `--level`, `--price`) sit in a row. Clicking one expands an options panel below (accordion — only one open at a time). Clicking a filter value instantly updates URL search params, triggering SSR re-render. Active categories show cyan + count badge. A `[clear]` link appears when any filter is active. The existing `<FilterLink>` component (used in resource cards for tag clicks) is unaffected.

**Tech Stack:** Next.js App Router, React `useSearchParams`/`useRouter`/`useTransition`, Tailwind CSS, existing constants from `lib/constants.ts`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `components/inline-filters.tsx` | **Create** | New accordion filter component — all filter UI in one file |
| `app/page.tsx` | **Modify** | Replace `<Filters>` + `<FilterChips>` with `<InlineFilters>` |
| `components/filters.tsx` | **Delete** | Old modal-based filter (replaced) |
| `components/filter-chips.tsx` | **Delete** | Old active-filter chips (absorbed into InlineFilters) |

**Files NOT touched:** `lib/queries.ts`, `lib/constants.ts`, `components/filter-link.tsx`, `components/resource-grid.tsx`, `components/ui/dialog.tsx`

---

## Chunk 1: Build InlineFilters Component

### Task 1: Create the InlineFilters component shell

**Files:**
- Create: `components/inline-filters.tsx`

- [ ] **Step 1: Create the component with category row rendering**

```tsx
// components/inline-filters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { TYPES, PILLARS, LEVELS, TYPE_LABELS, PILLAR_LABELS } from "@/lib/constants";

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
```

- [ ] **Step 2: Verify the file compiles**

Run: `cd /Users/mariomiletta/conductor/workspaces/builder-directory/pattaya && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `inline-filters.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/inline-filters.tsx
git commit -m "feat: add InlineFilters accordion component"
```

---

### Task 2: Wire InlineFilters into page and remove old components

**Files:**
- Modify: `app/page.tsx:1-6,84-94`
- Delete: `components/filters.tsx`
- Delete: `components/filter-chips.tsx`

- [ ] **Step 1: Update page.tsx imports and JSX**

In `app/page.tsx`:

Replace imports — remove the `Filters` and `FilterChips` imports, add `InlineFilters`:
```tsx
// Remove these two lines:
import { Filters } from "@/components/filters";
import { FilterChips } from "@/components/filter-chips";

// Add this:
import { InlineFilters } from "@/components/inline-filters";
```

In the `{/* Search + Filters */}` section, replace the three `<Suspense>` blocks (SearchBar, Filters, FilterChips) with two (SearchBar, InlineFilters):
```tsx
{/* Search + Filters */}
<section className="py-8 border-b border-border flex flex-col gap-4">
  <Suspense>
    <SearchBar />
  </Suspense>
  <Suspense>
    <InlineFilters />
  </Suspense>
</section>
```

- [ ] **Step 2: Delete old filter files**

```bash
rm components/filters.tsx components/filter-chips.tsx
```

- [ ] **Step 3: Check for broken imports**

Run: `cd /Users/mariomiletta/conductor/workspaces/builder-directory/pattaya && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors. (The only imports of these files were in `app/page.tsx`, which we just updated.)

- [ ] **Step 4: Verify dev server renders**

Run: `cd /Users/mariomiletta/conductor/workspaces/builder-directory/pattaya && npm run build 2>&1 | tail -20`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git add -u components/filters.tsx components/filter-chips.tsx
git commit -m "feat: replace modal filters with inline accordion

Remove Dialog-based filter modal and separate filter chips.
InlineFilters provides category accordion with instant URL toggle."
```

---

## Chunk 2: Manual Testing Checklist

### Task 3: Verify all filter behaviors

- [ ] **Step 1: Start dev server and test interactions**

Run: `npm run dev`

Manual test checklist:
1. Load `/` — see 4 category chips: `--type`, `--pillar`, `--level`, `--price`
2. Click `--type` — options panel expands below with left cyan border
3. Click `Tool` — URL updates to `/?type=tool`, results refresh, `--type` turns cyan with `(1)`
4. Click `Article` while `Tool` is active — URL becomes `/?type=tool&type=article`, count shows `(2)`
5. Click `Tool` again — deselects, URL becomes `/?type=article`, count shows `(1)`
6. Click `--pillar` — `--type` options collapse, `--pillar` options expand (accordion)
7. Click `Discovery` — both `--type (1)` and `--pillar (1)` show active
8. `[clear]` button appears on the right — click it, all filters removed
9. Click `--price` — `Free`/`Paid` are single-select (toggling, not multi-select)
10. Test with search active: filters combine with search query in URL

- [ ] **Step 2: Verify FilterLink still works with multi-select**

Click a tag on a resource card — should still apply filter via `FilterLink` component (unmodified). Note: `FilterLink` uses `params.set()` which replaces all values for that key with a single value. This is intentional — clicking a tag means "show me this specific type", overriding any multi-select state. Verify this works: have `type=tool&type=article` active, click a `#newsletter` tag on a card → URL should become `type=newsletter` (not append).

- [ ] **Step 3: Commit any fixes if needed**

---

## Summary

| What | Before | After |
|------|--------|-------|
| Filter trigger | `[--filter]` button → modal dialog | 4 inline category chips |
| Filter selection | Staged (select → apply) | Instant toggle via URL |
| Active filter display | Separate `FilterChips` row | Cyan category label + count |
| Clear action | Inside modal + chips row | Single `[clear]` in filter row |
| Components | `filters.tsx` + `filter-chips.tsx` + Dialog | `inline-filters.tsx` only |
| Result preview | None (modal covers page) | Live — results update as you toggle |
