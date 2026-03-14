---
phase: 04-infrastructure-and-deploy
plan: "03"
subsystem: infra
tags: [vercel, next.js, supabase, deploy, production, smoke-test]

# Dependency graph
requires:
  - phase: 04-01
    provides: RLS delete policy applied, migration history clean
  - phase: 03-01
    provides: instrumentation.ts env validation, SYNC_SECRET auth on edge function
  - phase: 02-01
    provides: terminal design system (Geist Mono, black/white/cyan)
provides:
  - Production Vercel URL serving the app from main branch with live Supabase data
  - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SYNC_SECRET configured in Vercel production environment
  - All 5 smoke test steps verified against live URL
affects: []

# Tech tracking
tech-stack:
  added: [vercel-cli v50.4.11]
  patterns: [vercel link + vercel env add + vercel --prod deploy sequence, .vercel/project.json gitignored per Vercel convention]

key-files:
  created: [.vercel/project.json (gitignored — created by vercel link)]
  modified: []

key-decisions:
  - "Production URL is https://product-builder-directory.vercel.app (canonical short URL, not a preview hash URL)"
  - ".vercel/project.json excluded from git via .gitignore — Vercel-standard pattern; project linkage lives on disk only"
  - "SYNC_SECRET (d227a9b...) matches the value set in Supabase edge function secrets during Plan 02"

patterns-established:
  - "Vercel deploy sequence: vercel link → vercel env add (x3) → vercel env ls (verify) → vercel --prod"
  - "instrumentation.ts validates NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY at startup — missing vars crash before cold start serves traffic"

requirements-completed: [INFR-04]

# Metrics
duration: 10min
completed: 2026-03-13
---

# Phase 4 Plan 03: Vercel Deploy Summary

**Next.js app live at https://product-builder-directory.vercel.app with live Supabase data, all 3 env vars set, and a full 5-step smoke test passing**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-13
- **Completed:** 2026-03-13
- **Tasks:** 2 (Task 1: Vercel project + deploy; Task 2: Smoke test)
- **Files modified:** 0 (`.vercel/project.json` created but gitignored)

## Accomplishments

- Vercel project created and linked to `github.com/mariomile/product-builder-directory` (main branch)
- All 3 required environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SYNC_SECRET`) set for production environment
- `vercel --prod` deploy completed without errors; production URL live at https://product-builder-directory.vercel.app
- Full 5-step smoke test passed: homepage (20 resources), search, filter, pagination, detail page

## Task Commits

This plan's Task 1 required manual user setup (Vercel CLI is interactive — `vercel link` requires scope selection in a TTY). No automated commits were generated for this plan.

1. **Task 1: Create Vercel project, set env vars, deploy to production** - manual user setup (Vercel CLI interactive; `.vercel/project.json` gitignored)
2. **Task 2: Smoke test verification** - user-confirmed pass ("smoke test passed")

**Plan metadata commit:** see docs commit below

## Files Created/Modified

- `.vercel/project.json` — Vercel project link metadata (`projectId: prj_x5X9rpFhJ2n8rCZHrRxk4ruZJyVS`, `orgId: team_XgOYEkteoFfC8zsHs5pCki4z`) — gitignored, not committed

## Decisions Made

- Production URL canonical form: `https://product-builder-directory.vercel.app` — Vercel assigned this as the stable URL for the main branch
- `.vercel/project.json` left gitignored per Vercel convention (contains org/project IDs, not secrets, but standard practice is to exclude)
- `SYNC_SECRET` value `d227a9b774c62f12cd056af873a91b49b14389438dd471c72e984d9861be7425` matches the value set in Supabase edge function secrets in Plan 02

## Deviations from Plan

None — plan executed exactly as written. Task 1 was correctly scoped as a manual user_setup task (interactive CLI). Smoke test passed all 5 steps on first attempt.

## Issues Encountered

None. `instrumentation.ts` startup env validation passed (no crash on cold start), confirming all 3 env vars were set correctly before deploy.

## User Setup Required

Task 1 was entirely manual per the plan's `user_setup` frontmatter:
- `vercel link` (interactive: org scope selection, project name, GitHub repo connection)
- `vercel env add NEXT_PUBLIC_SUPABASE_URL production`
- `vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production`
- `vercel env add SYNC_SECRET production`
- `vercel --prod` (triggered production deploy)

All steps completed by the user before the smoke test checkpoint.

## Next Phase Readiness

Phase 4 is complete. All 4 requirements (INFR-01 through INFR-04) are satisfied:
- INFR-01: DB migrations applied (Plan 01)
- INFR-02: Edge function deployed (Plan 02)
- INFR-03: MCP configured and verified (Plan 02)
- INFR-04: Production URL live with passing smoke test (this plan)

**Production URL: https://product-builder-directory.vercel.app**

The v1.0 milestone is achieved. The app is demo-ready.

---
*Phase: 04-infrastructure-and-deploy*
*Completed: 2026-03-13*
