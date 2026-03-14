---
phase: 01-stabilize
plan: "02"
subsystem: ui
tags: [next.js, supabase, cleanup, boilerplate, auth-removal, theme-switcher]

# Dependency graph
requires: []
provides:
  - Codebase free of Supabase auth template boilerplate (app/auth/, app/protected/, auth components)
  - theme-switcher component and ThemeSwitcher JSX removed from page.tsx
  - app/layout.tsx renders children directly with no ThemeProvider or next-themes
  - Clean build with only real product routes (/, /resources/[slug])
affects: [02-design, 03-security-performance]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Direct children render in layout.tsx — no ThemeProvider wrapper, no suppressHydrationWarning"
    - "nav in page.tsx contains only product identity span — no auth controls or theme toggles"

key-files:
  created: []
  modified:
    - app/page.tsx
  deleted:
    - app/auth/ (7 route files)
    - app/protected/ (layout.tsx, page.tsx)
    - components/theme-switcher.tsx
    - components/auth-button.tsx
    - components/logout-button.tsx
    - components/login-form.tsx
    - components/sign-up-form.tsx
    - components/forgot-password-form.tsx
    - components/update-password-form.tsx
    - components/deploy-button.tsx
    - components/env-var-warning.tsx
    - components/hero.tsx
    - components/next-logo.tsx
    - components/supabase-logo.tsx
    - components/tutorial/ (5 files)

key-decisions:
  - "app/layout.tsx was already clean from plan 01-01 (no ThemeProvider, no next-themes) — no changes needed"
  - "Deleted 26 boilerplate files atomically; real product components (resource-grid, search-bar, filters, resource-card, ui/) untouched"

patterns-established:
  - "Deletion-first stabilization: remove dead routes and components before adding new ones"

requirements-completed: [STAB-05]

# Metrics
duration: 3min
completed: 2026-03-12
---

# Phase 1 Plan 02: Boilerplate Removal Summary

**Deleted 26 Supabase auth template files and removed ThemeSwitcher from page.tsx, leaving only the product-specific codebase with a clean build.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-12T21:32:40Z
- **Completed:** 2026-03-12T21:35:00Z
- **Tasks:** 2
- **Files modified:** 1 (app/page.tsx — 2 line deletions), 26 files deleted

## Accomplishments

- Removed all Supabase auth boilerplate: app/auth/ (7 routes), app/protected/ (2 files), 12 auth/template components, components/tutorial/ (5 files)
- Removed ThemeSwitcher import and JSX from app/page.tsx — nav now contains only product identity
- Confirmed app/layout.tsx was already clean (no ThemeProvider) from plan 01-01
- `npm run build` exits clean with only 2 real product routes: / and /resources/[slug]

## Task Commits

Each task was committed atomically:

1. **Task 1: Delete all boilerplate directories and component files** - `cb7ac0c` (chore)
2. **Task 2: Update layout.tsx and page.tsx to remove boilerplate imports and JSX** - `a3bf469` (chore)

**Plan metadata:** (docs commit — see final_commit below)

## Files Created/Modified

- `app/page.tsx` — Removed ThemeSwitcher import and `<ThemeSwitcher />` JSX from nav (2 lines deleted)

### Files Deleted

- `app/auth/confirm/route.ts`
- `app/auth/error/page.tsx`
- `app/auth/forgot-password/page.tsx`
- `app/auth/login/page.tsx`
- `app/auth/sign-up-success/page.tsx`
- `app/auth/sign-up/page.tsx`
- `app/auth/update-password/page.tsx`
- `app/protected/layout.tsx`
- `app/protected/page.tsx`
- `components/auth-button.tsx`
- `components/deploy-button.tsx`
- `components/env-var-warning.tsx`
- `components/forgot-password-form.tsx`
- `components/hero.tsx`
- `components/login-form.tsx`
- `components/logout-button.tsx`
- `components/next-logo.tsx`
- `components/sign-up-form.tsx`
- `components/supabase-logo.tsx`
- `components/theme-switcher.tsx`
- `components/tutorial/code-block.tsx`
- `components/tutorial/connect-supabase-steps.tsx`
- `components/tutorial/fetch-data-steps.tsx`
- `components/tutorial/sign-up-user-steps.tsx`
- `components/tutorial/tutorial-step.tsx`
- `components/update-password-form.tsx`

## Decisions Made

- app/layout.tsx was already clean from plan 01-01 (ThemeProvider and next-themes had already been removed in the stubbing step). No further changes needed.
- Deleted all 26 boilerplate files atomically in a single commit per task rather than file by file.

## Deviations from Plan

None — plan executed exactly as written. The only observation: layout.tsx had already been cleaned in plan 01-01, so Task 2 only required changes to page.tsx (2 deletions).

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Codebase now expresses only what the product is: a read-only resource directory
- Phase 2 (Design Overhaul) can proceed against a clean, minimal component tree
- No dead routes, no dead components, no ThemeProvider overhead

---
*Phase: 01-stabilize*
*Completed: 2026-03-12*
