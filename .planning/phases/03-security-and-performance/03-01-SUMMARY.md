---
phase: 03-security-and-performance
plan: 01
subsystem: security
tags: [postgrest, rls, supabase, edge-functions, deno, nextjs, instrumentation]

requires:
  - phase: 01-stabilize
    provides: tsconfig that excludes supabase/functions from Next.js TS compilation
  - phase: 02-terminal-design-system
    provides: lib/queries.ts with getResources() to be patched

provides:
  - sanitizeSearch() function strips PostgREST injection characters before .or() interpolation
  - RLS DELETE policy for resources table (003_rls_delete.sql)
  - Authorization header gate on sync-raindrop edge function (SYNC_SECRET)
  - Startup env validation via instrumentation.ts register() hook

affects: [03-02-pagination, 04-cron-sync]

tech-stack:
  added: []
  patterns:
    - "sanitizeSearch: strip ,().%\"'\\;|* chars + trim + 100-char cap before PostgREST interpolation"
    - "instrumentation.ts register() hook for Next.js startup validation, NEXT_RUNTIME === nodejs guard"
    - "Deno.serve auth gate: check Authorization before try block so missing SYNC_SECRET returns 401 not 500"

key-files:
  created:
    - supabase/migrations/003_rls_delete.sql
    - instrumentation.ts
  modified:
    - lib/queries.ts
    - supabase/functions/sync-raindrop/index.ts

key-decisions:
  - "sanitizeSearch placed as unexported function above getResources — no external API surface change"
  - "Auth check in sync-raindrop placed BEFORE the try block so missing SYNC_SECRET itself is a 401, not a 500"
  - "ESLint circular structure bug confirmed pre-existing, out of scope — build passes, lint deferred"

patterns-established:
  - "Security: all user search input sanitized before PostgREST interpolation"
  - "Security: edge functions require explicit Authorization: Bearer <SECRET> header"
  - "Security: RLS policies are explicit for all DML operations (INSERT/UPDATE/DELETE)"
  - "Ops: Next.js instrumentation.ts validates required env vars before serving any requests"

requirements-completed: [SECR-01, SECR-02, SECR-03, SECR-04]

duration: 2min
completed: 2026-03-13
---

# Phase 03 Plan 01: Security Hardening Summary

**Four surgical security fixes: PostgREST injection sanitizer in getResources(), explicit RLS DELETE policy, Authorization header gate on sync-raindrop edge function, and startup env validation via Next.js instrumentation hook**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-13T13:54:24Z
- **Completed:** 2026-03-13T13:56:04Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Closed PostgREST injection vector — sanitizeSearch() strips ,().%"'\;|* before .or() interpolation, caps at 100 chars
- Added explicit RLS DELETE policy matching INSERT/UPDATE pattern — intent is now consistent and auditable
- Locked sync-raindrop edge function behind SYNC_SECRET Authorization header — unauthenticated requests receive 401 before any business logic runs
- Added Next.js instrumentation.ts register() hook that throws a descriptive startup error when required env vars are absent

## Task Commits

Each task was committed atomically:

1. **Task 1: Sanitize PostgREST search injection in lib/queries.ts** - `6d13de6` (feat)
2. **Task 2: Add RLS DELETE policy migration and startup env validation** - `f7f74e1` (feat)
3. **Task 3: Add authorization header check to sync-raindrop edge function** - `4648b8c` (feat)

**Plan metadata:** (created in final commit)

## Files Created/Modified

- `lib/queries.ts` - Added sanitizeSearch() function; getResources() now uses sanitized `safe` variable in .or()
- `supabase/migrations/003_rls_delete.sql` - CREATE POLICY "Authenticated delete" ON resources FOR DELETE USING (auth.role() = 'authenticated')
- `instrumentation.ts` - Next.js register() hook validates NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY on nodejs runtime
- `supabase/functions/sync-raindrop/index.ts` - Authorization check at top of Deno.serve handler before method check and try block

## Decisions Made

- `sanitizeSearch` is an unexported function — no API surface change for callers of `getResources()`
- Auth check placed before the `try` block in sync-raindrop so that a missing `SYNC_SECRET` env var returns 401 (not a 500 from inside the catch)
- `instrumentation.ts` is dependency-free — plain Array.filter, no Zod or envalid import

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `npm run lint` fails with ESLint 9 circular structure JSON error — confirmed pre-existing before my commits via git stash test. This is an ESLint 9 / eslintrc compatibility issue in the project config unrelated to this plan's changes. Logged as out-of-scope. Build passes cleanly.

## User Setup Required

**External services require manual configuration before sync-raindrop works end-to-end:**

- Add `SYNC_SECRET` to Supabase Dashboard -> Edge Functions -> Secrets
- Any cron or manual caller of sync-raindrop must pass `Authorization: Bearer <SYNC_SECRET>` header
- Run migration `003_rls_delete.sql` against production Supabase database

## Next Phase Readiness

- Plan 03-02 (pagination) can begin — `getResources()` signature unchanged, sanitizer is in place
- Phase 4 cron configuration must set the `SYNC_SECRET` header when invoking sync-raindrop
- ESLint config issue should be addressed before public deployment (tracked as pre-existing, not created here)

---
*Phase: 03-security-and-performance*
*Completed: 2026-03-13*
