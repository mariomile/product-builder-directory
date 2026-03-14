# Retrospective: Product Builder Directory

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-13
**Phases:** 4 | **Plans:** 10

### What Was Built

1. Pinned all dependencies to exact versions; resolved Radix UI meta-package conflict
2. Removed Supabase auth template boilerplate — clean minimal codebase
3. Terminal design system: Geist Mono globally, black/white/cyan palette, zero border-radius
4. Full UI overhaul: monochrome cards, Cmd+K, error boundaries, loading skeletons
5. Security: PostgREST injection fix, RLS DELETE policy, edge function auth, startup env validation
6. Performance: 20-item pagination (URL-driven), filtered result count, 300ms debounce
7. Production live: Supabase EU, Gemini 2.5 Flash sync pipeline, Vercel deploy, 5-step smoke test passing

### What Worked

- **4-phase coarse granularity** matched the 5-day deadline perfectly — no over-planning
- **Design before infrastructure** (Phase 2 → 4) prevented blocking the deploy on design polish; both could proceed independently
- **Wave execution within phases** — security (03-01) before pagination (03-02) because both touched `lib/queries.ts`
- **GSD atomic commits per task** made the git log a clean audit trail of every change

### What Was Inefficient

- Gemini 2.5 Flash was unavailable initially, required switching models mid-execution (Claude Haiku → Gemini 2.0 Flash Lite → Gemini 2.5 Flash) — pre-flight API key validation would have caught this
- Vercel deploy (04-03) required fully manual TTY interaction — interactive CLI not automatable; could have scaffolded a GitHub Actions deploy instead
- ESLint 9 circular structure bug was pre-existing but caused confusion during Phase 3 execution; flagging pre-existing lint failures upfront would reduce noise

### Patterns Established

- `lib/constants.ts` and `lib/validators.ts` zero-import rule: edge-function-safe, no circular deps
- `instrumentation.ts` for startup validation using `NEXT_RUNTIME === "nodejs"` guard
- `count: "exact"` + `.range()` for paginated Supabase queries — count returned via `Content-Range`, single round-trip
- Page reset pattern: `params.delete('page')` at the top of every filter handler
- `PaginationBar` hides itself when `totalPages <= 1` — clean empty-state behavior

### Key Lessons

- **Gemini structured output**: always set `responseMimeType: "application/json"` + `maxOutputTokens: 2048` for reliable structured responses from Gemini
- **Supabase MCP vs CLI**: MCP `apply_migration` endpoint returned 404 in this project; fallback to Management API `/database/query` endpoint worked reliably
- **Terminal aesthetic discipline**: `rounded-none` idiomatically on all shadcn primitives; Tailwind `font-mono` resolves via CSS variable (`.variable` on body, not `.className`)
- **Type-safe pagination**: `getResources()` return shape change (`data + filteredCount + totalPages + currentPage`) broke `resource-grid.tsx` mid-execution — both files must update before build passes; commit after both

### Cost Observations

- Sessions: ~1 main session per phase (parallel wave execution within phases)
- Model: Sonnet 4.6 throughout (executor + verifier)
- Notable: 10 plans, 2 days, ~1,995 LOC shipped cleanly — GSD wave execution with parallel agents kept execution lean

---

## Cross-Milestone Trends

| Metric | v1.0 |
|--------|------|
| Duration | 2 days |
| Plans | 10 |
| LOC | ~1,995 TypeScript/TSX |
| Files changed | 105 |
| Phases | 4 |
| Verification score | 8/8 (last phase) |
