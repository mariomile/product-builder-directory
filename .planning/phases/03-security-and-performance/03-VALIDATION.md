---
phase: 3
slug: security-and-performance
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test infrastructure in project |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd:verify-work`:** Full suite must be green + manual browser smoke test
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | SECR-01 | build | `npm run build` | N/A | ⬜ pending |
| 3-01-02 | 01 | 1 | SECR-02 | build | `npm run build` | ❌ Wave 0 | ⬜ pending |
| 3-01-03 | 01 | 1 | SECR-03 | build | `npm run build` | N/A | ⬜ pending |
| 3-01-04 | 01 | 1 | SECR-04 | build | `npm run build` | N/A | ⬜ pending |
| 3-02-01 | 02 | 2 | PERF-01 | build | `npm run build` | N/A | ⬜ pending |
| 3-02-02 | 02 | 2 | PERF-02 | build | `npm run build` | N/A | ⬜ pending |
| 3-02-03 | 02 | 2 | STAB-01 | build | `npm run build` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `supabase/migrations/003_rls_delete.sql` — DELETE policy for SECR-02

*All other requirements use existing infrastructure (`npm run build` + TypeScript).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Injection payload returns zero results | SECR-01 | No integration test harness | Type `,description.eq.secret` in search — confirm zero results |
| Edge function rejects unauthorized | SECR-03 | Requires live infra (Phase 4) | `curl -s -o /dev/null -w "%{http_code}" <fn-url>` must return 401 |
| Pagination shows ≤20 items/page | PERF-01 | Requires live DB | Seed 25+ rows, verify page 1 = 20, page 2 = remainder |
| Filtered count matches DB | PERF-02 | Requires live DB | Apply filter, count cards, compare to count badge |
| Single request per search burst | STAB-01 | Requires browser | DevTools Network: confirm 1 request per 300ms idle |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
