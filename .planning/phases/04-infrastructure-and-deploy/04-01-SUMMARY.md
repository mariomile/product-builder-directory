---
phase: 04-infrastructure-and-deploy
plan: 01
subsystem: database
tags: [supabase, postgres, rls, row-level-security, migrations, security]

# Dependency graph
requires:
  - phase: 03-security-and-performance
    provides: "003_rls_delete.sql migration file written (but not applied)"
provides:
  - "RLS DELETE policy active on resources table (4 total policies)"
  - "002_seed retroactively tracked in supabase_migrations.schema_migrations"
  - "DB production-ready before Vercel URL goes live"
affects: [04-02, deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Supabase Management API (database/query endpoint) used for live DDL and DML execution"
    - "Migration annotations: applied-date comments added to .sql files for traceability"

key-files:
  created: []
  modified:
    - supabase/migrations/003_rls_delete.sql
    - supabase/migrations/002_seed.sql

key-decisions:
  - "Used Supabase Management API /database/query endpoint (not CLI or MCP apply_migration) — MCP apply_migration endpoint not available, CLI not installed; REST API is equivalent and confirmed working"
  - "002_seed version set to 20240101000002 — retroactive tracking with ON CONFLICT DO NOTHING prevents duplicate inserts"
  - "Migration files annotated with applied-date comments for traceability (do not re-run 002_seed)"

patterns-established:
  - "Live DB changes via Supabase Management API with Python subprocess for correct JSON encoding"
  - "Empty array response [] from database/query = DDL/DML success"

requirements-completed: [INFR-01]

# Metrics
duration: 2min
completed: 2026-03-13
---

# Phase 4 Plan 1: Infrastructure and Deploy — DB Security Migration Summary

**RLS DELETE policy applied to resources table (4/4 policies active) and 002_seed retroactively tracked in supabase_migrations, closing the security gap before production deploy**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-13T15:22:33Z
- **Completed:** 2026-03-13T15:24:33Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Applied `003_rls_delete.sql` to live Supabase DB — resources table now has all 4 RLS policies (SELECT, INSERT, UPDATE, DELETE)
- Inserted retroactive tracking record for `002_seed` in `supabase_migrations.schema_migrations` (version 20240101000002)
- Verified resource count remains exactly 20 — no duplicate seed inserts

## Task Commits

Each task was committed atomically:

1. **Task 1: Apply 003_rls_delete migration** - `eabf825` (feat)
2. **Task 2: Mark 002_seed as tracked in migration history** - `ecaa070` (chore)

## Files Created/Modified

- `supabase/migrations/003_rls_delete.sql` - Added applied-date annotation (applied 2026-03-13)
- `supabase/migrations/002_seed.sql` - Added retroactive tracking note and re-run warning

## Decisions Made

- Used Supabase Management API `/v1/projects/{ref}/database/query` endpoint instead of CLI (`supabase db push`) or MCP `apply_migration` — Supabase CLI not installed, MCP `/v1/projects/{ref}/migrations` endpoint returned 404; REST API achieved equivalent result
- `002_seed` version `20240101000002` chosen to sort before `001_init` (`20260313114752`) in version order, making the retroactive nature of the tracking explicit
- `ON CONFLICT (version) DO NOTHING` ensures idempotent tracking insert — safe to retry

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Used REST API instead of MCP apply_migration tool**
- **Found during:** Task 1 (Apply 003_rls_delete migration)
- **Issue:** Plan specified `apply_migration` MCP tool; Supabase CLI not installed; MCP `/v1/projects/{ref}/migrations` returned "Cannot POST" 404
- **Fix:** Used Supabase Management API `/v1/projects/{ref}/database/query` endpoint directly via curl with Python JSON encoding — achieves identical result (DDL executed against live DB)
- **Files modified:** None (workaround was execution method, not file change)
- **Verification:** `SELECT policyname, cmd FROM pg_policies WHERE tablename = 'resources' ORDER BY cmd` returned 4 rows including "Authenticated delete" DELETE policy
- **Committed in:** eabf825 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking — execution method substitution)
**Impact on plan:** Identical outcome. The API endpoint used is the underlying mechanism the MCP tool wraps. No scope creep.

## Issues Encountered

- Shell heredoc JSON encoding failed on single-quoted SQL strings — switched to Python subprocess with `json.dumps()` for correct escaping. Resolved immediately.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- DB is production-ready: 4 RLS policies active, seed data intact, migration history complete
- No blockers for Vercel deploy (Phase 04-02 or subsequent plans)
- `002_seed` clearly marked as do-not-re-run in the migration file

---
*Phase: 04-infrastructure-and-deploy*
*Completed: 2026-03-13*

## Self-Check: PASSED

- supabase/migrations/003_rls_delete.sql: FOUND
- supabase/migrations/002_seed.sql: FOUND
- .planning/phases/04-infrastructure-and-deploy/04-01-SUMMARY.md: FOUND
- Commit eabf825: FOUND
- Commit ecaa070: FOUND
