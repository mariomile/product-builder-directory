---
phase: 02-terminal-design-system
plan: 02
subsystem: ui
tags: [tailwind, shadcn, react, terminal-design, keyboard-shortcut]

# Dependency graph
requires:
  - phase: 02-01
    provides: lib/constants.ts with TYPE_LABELS, PILLAR_LABELS, TYPE_BADGE_CLASSES, TYPES, PILLARS, LEVELS

provides:
  - Monochrome terminal badge system across all resource cards and detail pages
  - Sharp corners (rounded-none) on all four shadcn UI primitives (badge, card, button, input)
  - Cmd+K keyboard shortcut for search input focus
  - components/ and app/ purged of all rainbow and off-palette color classes

affects: [03-security-performance, any component consuming badge/card/button/input]

# Tech tracking
tech-stack:
  added: []
  patterns: [import-from-constants, terminal-monochrome-palette, rounded-none-convention]

key-files:
  created: []
  modified:
    - components/ui/badge.tsx
    - components/ui/card.tsx
    - components/ui/button.tsx
    - components/ui/input.tsx
    - components/resource-card.tsx
    - components/filters.tsx
    - components/search-bar.tsx
    - app/resources/[slug]/page.tsx

key-decisions:
  - "rounded-none used idiomatically (not rounded-[0px]) across all shadcn primitives"
  - "Free badge uses text-primary (cyan) as positive terminal accent; Paid uses text-muted-foreground"
  - "Featured badge uses border-primary text-primary outline variant (no filled amber)"
  - "Cmd+K listener uses metaKey || ctrlKey for cross-platform (Mac + Windows)"

patterns-established:
  - "rounded-none-convention: All UI primitives use rounded-none — never rounded-md/xl/full on interactive elements"
  - "import-from-constants: All label maps and filter arrays imported from lib/constants, never duplicated in components"
  - "terminal-monochrome-palette: Free=text-primary(cyan), Paid=text-muted-foreground, Featured/type-badge=border-primary text-primary"

requirements-completed: [DSGN-04, DSGN-05, DSGN-07]

# Metrics
duration: 2min
completed: 2026-03-13
---

# Phase 2 Plan 02: Terminal Component Restyle Summary

**Eight files restyled to terminal aesthetic: monochrome badge palette, sharp corners on all shadcn primitives, Cmd+K search shortcut, and rainbow/off-palette colors fully purged from components and detail page**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-13T09:42:10Z
- **Completed:** 2026-03-13T09:44:34Z
- **Tasks:** 2 automated (Task 3 is human-verify checkpoint)
- **Files modified:** 8

## Accomplishments

- badge, card, button, input shadcn primitives: `rounded-md`/`rounded-xl` replaced with `rounded-none` throughout
- resource-card.tsx: rainbow `typeColors` deleted, monochrome `TYPE_BADGE_CLASSES` from constants applied; tag spans, Free/Paid colors all terminal-palette; card hover changed to `hover:border-primary`
- filters.tsx: local `TYPES`, `PILLARS`, `LEVELS` deleted; imported from `@/lib/constants`
- search-bar.tsx: `useRef` + `useEffect` Cmd+K listener added; placeholder updated to show shortcut; spinner `rounded-full` changed to `rounded-none`
- `[slug]/page.tsx`: local `typeLabels`/`pillarLabels` deleted; `TYPE_LABELS`/`PILLAR_LABELS` imported from constants; Featured/Free/Paid badges de-rainbowed to terminal palette

## Task Commits

Each task was committed atomically:

1. **Task 1: Restyle shadcn primitives and resource-card for terminal aesthetic** - `392d866` (feat)
2. **Task 2: Add Cmd+K to search-bar and purge off-palette colors from detail page** - `9f37859` (feat)

**Plan metadata:** pending final commit

## Files Created/Modified

- `components/ui/badge.tsx` - rounded-md -> rounded-none in cva base
- `components/ui/card.tsx` - rounded-xl -> rounded-none on Card div
- `components/ui/button.tsx` - rounded-md -> rounded-none in cva base and sm/lg size variants
- `components/ui/input.tsx` - rounded-md -> rounded-none in className
- `components/resource-card.tsx` - full restyle: TYPE_BADGE_CLASSES, removed local duplicates, terminal color palette
- `components/filters.tsx` - removed local TYPES/PILLARS/LEVELS, imported from lib/constants
- `components/search-bar.tsx` - Cmd+K listener with useRef/useEffect, placeholder updated, spinner fixed
- `app/resources/[slug]/page.tsx` - removed local typeLabels/pillarLabels, imported from constants, badge colors fixed

## Decisions Made

- `rounded-none` used idiomatically (not arbitrary `rounded-[0px]`) per idiomatic Tailwind convention
- Free badge maps to `text-primary` (cyan) — positive terminal accent color
- Paid badge maps to `text-muted-foreground` — neutral, not alarming
- Featured badge uses `border-primary text-primary` outline variant (no filled colors)
- Cmd+K checks `metaKey || ctrlKey` for cross-platform compatibility

## Deviations from Plan

None - plan executed exactly as written. The spinner `rounded-full` fix on search-bar was explicitly mentioned in Task 2 action block.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Terminal aesthetic is complete pending human visual verification (Task 3 checkpoint)
- All shadcn primitives now have sharp corners — any future component additions must use `rounded-none`
- All constants imports wired correctly — Phase 3 can safely extend lib/constants.ts

---
*Phase: 02-terminal-design-system*
*Completed: 2026-03-13*
