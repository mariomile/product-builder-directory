---
phase: 1
slug: stabilize
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test files exist; shell smoke tests used |
| **Config file** | none — no test config needed for this phase |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm install 2>&1 \| grep -iE "warn\|peer dep"` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm install 2>&1 | grep -iE "warn|peer dep"`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | STAB-03 | smoke | `grep "latest" package.json \| wc -l` (expect 0) | N/A | ⬜ pending |
| 1-01-02 | 01 | 1 | STAB-03 | smoke | `grep '"\^' package.json \| wc -l` (expect 0) | N/A | ⬜ pending |
| 1-01-03 | 01 | 1 | QUAL-02 | smoke | `grep '"radix-ui"' package.json \| wc -l` (expect 0) | N/A | ⬜ pending |
| 1-01-04 | 01 | 1 | QUAL-02 | smoke | `npm install 2>&1 \| grep -iE "warn\|peer dep"` (expect empty) | N/A | ⬜ pending |
| 1-02-01 | 02 | 1 | STAB-05 | smoke | `ls app/auth 2>&1 \| grep "No such"` (expect match) | N/A | ⬜ pending |
| 1-02-02 | 02 | 1 | STAB-05 | smoke | `ls app/protected 2>&1 \| grep "No such"` (expect match) | N/A | ⬜ pending |
| 1-02-03 | 02 | 1 | STAB-05 | smoke | `ls components/theme-switcher.tsx 2>&1 \| grep "No such"` (expect match) | N/A | ⬜ pending |
| 1-02-04 | 02 | 1 | STAB-05 | smoke | `npm run build` (no broken imports) | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

No test framework installation needed — this phase has no unit-testable logic. All verification is shell-command-level smoke testing against filesystem state and npm output.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| npm install on fresh clone = identical node_modules | STAB-03 | Requires clean environment | Clone repo to temp dir, run `npm ci`, verify no resolution differences |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
