---
phase: 01-stabilize
plan: "01"
subsystem: infra
tags: [npm, package-json, dependencies, next, radix-ui, typescript]

# Dependency graph
requires: []
provides:
  - Exact-pinned package.json with no floating version specifiers
  - radix-ui meta-package removed from package.json and node_modules
  - next-themes removed from package.json, node_modules, and all source files
  - eslint-config-next aligned to next version (both 16.1.6)
  - supabase/functions excluded from Next.js TypeScript compilation
  - Clean npm install (zero peer dependency warnings)
  - Passing npm run build
affects: [02-design-overhaul, 03-security-performance, 04-infrastructure]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Exact version pinning: all package.json entries use bare version strings sourced from lock file"
    - "Supabase edge functions excluded from Next.js tsconfig to prevent Deno ESM URL resolution errors"

key-files:
  created: []
  modified:
    - package.json
    - app/layout.tsx
    - components/theme-switcher.tsx
    - tsconfig.json

key-decisions:
  - "Pin exact versions from package-lock.json, not the versions specified in the PLAN.md (plan had slightly older patch versions)"
  - "Stub theme-switcher.tsx as null component rather than deleting it; dark mode to be re-evaluated in Phase 2 Design Overhaul"
  - "Exclude supabase/functions from tsconfig.json to fix Deno ESM URL type error blocking Next.js build"

patterns-established:
  - "Pin exact: all direct dependencies use bare version strings, no ^ or ~"

requirements-completed: [STAB-03, QUAL-02]

# Metrics
duration: 3min
completed: 2026-03-12
---

# Phase 1 Plan 01: Dependency Pinning and Radix/Themes Cleanup Summary

**Exact-version pinning of all 24 direct dependencies, radix-ui meta-package and next-themes removed, Next.js 16.1.6 build passing with zero peer dependency warnings**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-12T21:08:02Z
- **Completed:** 2026-03-12T21:10:21Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- All 24 direct dependencies (13 runtime, 11 dev) pinned to exact versions from package-lock.json
- `radix-ui` meta-package and `next-themes` removed from package.json and node_modules
- `eslint-config-next` aligned to `16.1.6` to match the `next` version (was `15.3.1`)
- `npm install` produces zero peer dependency warnings
- `npm run build` exits 0 with 15 pages compiled

## Final Pinned Versions

**Runtime dependencies:**
- `@radix-ui/react-checkbox`: 1.3.3
- `@radix-ui/react-dropdown-menu`: 2.1.16
- `@radix-ui/react-label`: 2.1.8
- `@radix-ui/react-slot`: 1.2.4
- `@supabase/ssr`: 0.9.0
- `@supabase/supabase-js`: 2.99.1
- `class-variance-authority`: 0.7.1
- `clsx`: 2.1.1
- `lucide-react`: 0.511.0
- `next`: 16.1.6
- `react`: 19.2.4
- `react-dom`: 19.2.4
- `tailwind-merge`: 3.5.0

**Dev dependencies:**
- `@eslint/eslintrc`: 3.3.5
- `@types/node`: 20.19.37
- `@types/react`: 19.2.14
- `@types/react-dom`: 19.2.3
- `autoprefixer`: 10.4.27
- `eslint`: 9.39.4
- `eslint-config-next`: 16.1.6
- `postcss`: 8.5.8
- `tailwindcss`: 3.4.19
- `tailwindcss-animate`: 1.0.7
- `typescript`: 5.9.3

## Task Commits

Each task was committed atomically:

1. **Task 1: Pin all dependencies to exact versions** - `2a996bf` (chore)
2. **Task 2: Remove next-themes, fix build blocking issues** - `a1e5aa6` (fix)

## Files Created/Modified

- `package.json` - All 24 dependencies exact-pinned; radix-ui and next-themes removed
- `app/layout.tsx` - ThemeProvider wrapper removed (next-themes removed)
- `components/theme-switcher.tsx` - Stubbed to null component; dark mode deferred to Phase 2
- `tsconfig.json` - Added `supabase/functions` to exclude list to prevent Deno ESM build failure

## Decisions Made

- Used exact versions as resolved in package-lock.json rather than the older patch versions listed in the plan (the plan listed e.g. `@radix-ui/react-checkbox: 1.3.1` but lock had `1.3.3` — used lock file as the source of truth)
- Stubbed `ThemeSwitcher` as a null component rather than deleting it or the import sites in `app/page.tsx` and `app/protected/layout.tsx`; this avoids a wider refactor and leaves the Phase 2 design pass to decide on the final dark mode approach
- Excluded `supabase/functions/` from tsconfig rather than modifying the edge function itself — the edge function is Deno code and should not be TypeScript-checked by the Next.js compiler

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed next-themes import sites in app/layout.tsx and components/theme-switcher.tsx**
- **Found during:** Task 2 (npm run build)
- **Issue:** Build failed with "Module not found: Can't resolve 'next-themes'" in two files after removing the package from package.json
- **Fix:** Removed ThemeProvider wrapper from app/layout.tsx; stubbed theme-switcher.tsx to return null
- **Files modified:** app/layout.tsx, components/theme-switcher.tsx
- **Verification:** Build passes after fix
- **Committed in:** a1e5aa6 (Task 2 commit)

**2. [Rule 3 - Blocking] Excluded supabase/functions from tsconfig.json**
- **Found during:** Task 2 (npm run build, after fixing next-themes issue)
- **Issue:** TypeScript build failed with "Cannot find module 'https://esm.sh/@supabase/supabase-js@2'" because the Next.js tsconfig `include: ["**/*.ts"]` glob picked up a Deno edge function that uses URL-style ESM imports
- **Fix:** Added `supabase/functions` to the tsconfig `exclude` array
- **Files modified:** tsconfig.json
- **Verification:** Build passes after fix
- **Committed in:** a1e5aa6 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both fixes were directly caused by removing next-themes and were required to achieve a passing build. No scope creep.

## Issues Encountered

None beyond the two auto-fixed deviations documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Dependency manifest is now deterministic: `npm ci` on a clean checkout will always produce identical node_modules
- Build is clean and passing — Phase 2 (Design Overhaul) can proceed without dependency noise
- Dark mode: ThemeSwitcher is currently a no-op stub; Phase 2 should decide whether to implement dark mode natively (CSS variables only) or re-add a theme library

---
## Self-Check: PASSED

- package.json: FOUND
- app/layout.tsx: FOUND
- components/theme-switcher.tsx: FOUND
- tsconfig.json: FOUND
- SUMMARY.md: FOUND
- Commit 2a996bf: FOUND
- Commit a1e5aa6: FOUND

---
*Phase: 01-stabilize*
*Completed: 2026-03-12*
