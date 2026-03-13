---
phase: 02-terminal-design-system
plan: 01
subsystem: ui
tags: [tailwind, css-variables, geist-mono, dark-mode, design-system, next.js]

# Dependency graph
requires:
  - phase: 01-stabilize
    provides: clean Next.js app with Supabase, no broken imports, no theme switcher boilerplate
provides:
  - Forced dark mode via className="dark" on <html>
  - Terminal CSS variable palette (black/white/cyan, zero radius) in globals.css
  - Geist Mono font wired globally through Tailwind font-sans and font-mono utilities
  - lib/constants.ts as single source of truth for all label/badge/filter data
affects: [02-02-component-restyle, 02-03-layout-polish, 03-performance-security, 04-infrastructure]

# Tech tracking
tech-stack:
  added: [Geist_Mono (next/font/google)]
  patterns:
    - CSS variable palette with identical :root and .dark blocks (always-dark pattern)
    - Import-free pure data constants file for edge-function compatibility
    - Tailwind fontFamily override mapping font-sans and font-mono to Geist Mono

key-files:
  created: [lib/constants.ts]
  modified: [app/layout.tsx, app/globals.css, tailwind.config.ts]

key-decisions:
  - "Geist_Mono uses .variable not .className on body so Tailwind font-mono utility resolves it via CSS variable"
  - "lib/constants.ts has zero imports — prevents circular deps and keeps file edge-function safe for Phase 4"
  - "TYPE_BADGE_CLASSES uses monochrome terminal palette (border-primary for tool/framework, border-border for rest) instead of rainbow colors"

patterns-established:
  - "Always-dark pattern: identical CSS variable values in both :root and .dark — class on html activates .dark block, :root is fallback with same values"
  - "Constants-first: all label maps and filter arrays live in lib/constants.ts, components import from there"

requirements-completed: [DSGN-01, DSGN-02, DSGN-03, QUAL-01]

# Metrics
duration: 1min
completed: 2026-03-13
---

# Phase 02-01: Terminal Design System Foundation Summary

**Forced dark terminal aesthetic with black/cyan CSS variables, Geist Mono font globally via Tailwind, and lib/constants.ts centralizing all label/badge/filter data**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-13T09:34:13Z
- **Completed:** 2026-03-13T09:35:44Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Replaced Geist (sans) with Geist_Mono, forced dark mode on `<html className="dark">`, and wired font via Tailwind fontFamily override
- Rewrote globals.css with terminal palette: `--background: 0 0% 0%`, `--primary: 180 100% 50%` (cyan), `--radius: 0rem`
- Created `lib/constants.ts` with 6 exports (TYPE_LABELS, PILLAR_LABELS, TYPE_BADGE_CLASSES, TYPES, PILLARS, LEVELS) and zero imports

## Task Commits

Each task was committed atomically:

1. **Task 1: Force dark mode, swap to Geist Mono, rewrite terminal CSS palette** - `7cd6e00` (feat)
2. **Task 2: Create lib/constants.ts — single source of truth for all label and filter maps** - `5bf9b8b` (feat)

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified

- `app/layout.tsx` - Imports Geist_Mono, sets `className="dark"` on html, applies `${geistMono.variable} font-mono antialiased` to body
- `app/globals.css` - Terminal CSS variable palette in both :root and .dark (identical values, always-dark pattern)
- `tailwind.config.ts` - Added fontFamily.sans and fontFamily.mono both resolving to `var(--font-geist-mono)`
- `lib/constants.ts` - New pure-data file: TYPE_LABELS, PILLAR_LABELS, TYPE_BADGE_CLASSES, TYPES, PILLARS, LEVELS

## Decisions Made

- Geist_Mono configured with `.variable` (not `.className`) on body so the CSS custom property is available for Tailwind to resolve via `font-mono` utility class
- `lib/constants.ts` kept import-free to eliminate circular dependency risk and maintain edge-function compatibility (needed for Phase 4 Supabase Edge Functions)
- TYPE_BADGE_CLASSES uses monochrome terminal palette — cyan (`border-primary text-primary`) for tool/framework, neutral (`border-border text-foreground`) for all others

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Terminal design system foundation is complete; all CSS variables and the constants file are in place
- Plan 02-02 (component restyle) can now import from `lib/constants.ts` and rely on the CSS variable palette
- No blockers

---
*Phase: 02-terminal-design-system*
*Completed: 2026-03-13*

## Self-Check: PASSED

All files exist: lib/constants.ts, app/layout.tsx, app/globals.css, tailwind.config.ts, 02-01-SUMMARY.md
All commits found: 7cd6e00 (Task 1), 5bf9b8b (Task 2)
