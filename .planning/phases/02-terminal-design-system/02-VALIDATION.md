---
phase: 2
slug: terminal-design-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None installed — `npm run build` + `npm run lint` as proxy |
| **Config file** | `package.json` (build/lint scripts) |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd:verify-work`:** Full build + lint green + manual browser visual check
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 02-01 | 1 | DSGN-01 | manual+build | `npm run build` | ❌ Wave 0 | ⬜ pending |
| 2-01-02 | 02-01 | 1 | DSGN-02 | manual+build | `npm run build` | ❌ Wave 0 | ⬜ pending |
| 2-01-03 | 02-01 | 1 | DSGN-03 | build | `npm run build` | ❌ Wave 0 | ⬜ pending |
| 2-01-04 | 02-01 | 1 | QUAL-01 | lint/grep | `grep -r "const typeLabels" --include="*.tsx" --include="*.ts" components/ app/` returns empty | ❌ Wave 0 | ⬜ pending |
| 2-02-01 | 02-02 | 2 | DSGN-04 | lint/grep | `grep -r "bg-blue\|bg-purple\|bg-green-100\|bg-pink\|bg-orange\|bg-amber" components/resource-card.tsx` returns empty | ❌ Wave 0 | ⬜ pending |
| 2-02-02 | 02-02 | 2 | DSGN-05 | lint/grep | `grep -r "text-green-600\|text-orange-600" components/ app/` returns empty | ❌ Wave 0 | ⬜ pending |
| 2-02-03 | 02-02 | 2 | DSGN-07 | manual | Browser: Cmd+K focuses search input | ❌ Wave 0 | ⬜ pending |
| 2-03-01 | 02-03 | 2 | STAB-02 | build | `npm run build` (error.tsx type checks) | ❌ Wave 0 | ⬜ pending |
| 2-03-02 | 02-03 | 2 | DSGN-06 | build | `npm run build` (skeleton imports resolve) | ❌ Wave 0 | ⬜ pending |
| 2-03-03 | 02-03 | 2 | STAB-04 | build | `npm run build` (`lib/validators.ts` type-checks) | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No test runner exists in the project. Given the March 17 deadline, visual correctness is the primary success criterion and `npm run build` serves as the automated gate.

- [ ] Confirm `npm run build` runs clean before Phase 2 execution starts (baseline green)
- [ ] Manual browser verification checklist ready for final sign-off

*No new test infrastructure needed — build + lint + grep checks are sufficient for this phase's scope.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Geist Mono applied globally | DSGN-02 | Font rendering requires browser | Load localhost:3000, open DevTools, inspect `body` font-family — should show `Geist Mono` or `--font-geist-mono` |
| Dark mode forced on load | DSGN-03 | Visual check | Open localhost:3000 in incognito — background must be black, text near-white |
| No rainbow colors anywhere | DSGN-01/04 | Requires visual scan | Browse homepage and detail page — no blue/purple/green/orange badge colors |
| Zero rounded corners | DSGN-01 | Visual check | Inspect badges, cards, buttons, inputs — all must have sharp corners |
| Terminal-styled loading skeleton | DSGN-06 | Requires slow network simulation | DevTools → Network → Slow 3G → reload homepage — skeleton must show, not plain text |
| Cmd+K focuses search | DSGN-07 | Keyboard interaction | Press Cmd+K from any position on homepage — search input gets focus |
| Error boundary terminal style | STAB-02 | Requires error trigger | Visit `/resources/nonexistent-slug-xyz` — should show terminal `[ERROR]` box, not crash |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
