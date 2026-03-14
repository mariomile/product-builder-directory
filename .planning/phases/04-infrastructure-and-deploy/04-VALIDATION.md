---
phase: 4
slug: infrastructure-and-deploy
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test framework installed |
| **Config file** | None |
| **Quick run command** | Manual: `execute_sql: SELECT COUNT(*) FROM resources` |
| **Full suite command** | Manual: 5 MCP verification queries + browser smoke test |
| **Estimated runtime** | ~5 minutes (manual) |

---

## Sampling Rate

- **After every task commit:** Run manual smoke test (verify production URL responds)
- **After every plan wave:** Full 5-query MCP verification + edge function manual trigger
- **Before `/gsd:verify-work`:** All 4 INFR requirements manually verified
- **Max feedback latency:** N/A (manual verification phase)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 1 | INFR-01 | manual | `execute_sql: SELECT COUNT(*) FROM resources` | ❌ manual only | ⬜ pending |
| 4-01-02 | 01 | 1 | INFR-01 | manual | `execute_sql: SELECT policyname FROM pg_policies WHERE tablename='resources'` | ❌ manual only | ⬜ pending |
| 4-02-01 | 02 | 1 | INFR-02 | manual | 5 SQL queries via `execute_sql` | ❌ manual only | ⬜ pending |
| 4-02-02 | 02 | 1 | INFR-03 | manual | POST to edge function URL with SYNC_SECRET header | ❌ manual only | ⬜ pending |
| 4-03-01 | 03 | 2 | INFR-04 | manual | `vercel env ls production` + browser load | ❌ manual only | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*None — this is an operational deployment phase with no automated test infrastructure. All verification is manual SQL queries and browser smoke tests. No test files to create.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 20 resources in live Supabase DB, 003_rls_delete migration applied | INFR-01 | No test framework; infra deployment | `execute_sql: SELECT COUNT(*) FROM resources` (expect 20); `SELECT policyname FROM pg_policies WHERE tablename='resources'` (expect 4 policies) |
| 5 MCP demo queries return correct results | INFR-02 | MCP tool invocation; no test framework | Run 5 SQL queries via `execute_sql`: count, featured, pillar filter, ILIKE search, RLS policy check |
| Edge function deployed with cron schedule; test sync completes | INFR-03 | Live network call to Raindrop/Claude; no test framework | POST to edge function URL with `Authorization: Bearer <SYNC_SECRET>`; verify 200 response and new resource appears in DB |
| Vercel URL loads homepage with 20 resources; search/filter/detail work | INFR-04 | Browser navigation required; no test framework | Open production URL in browser; verify 20 resources visible; test search, filter by type/pillar, click resource card to detail page |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < N/A (manual phase)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
