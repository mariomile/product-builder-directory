# Roadmap: Product Builder Directory

## Overview

Transform the existing Next.js MVP into a deployed, demo-ready terminal-styled resource directory in 4 phases over 5 days. Phase 1 stabilizes the codebase (pin deps, remove boilerplate). Phase 2 delivers the core terminal design system -- the milestone's identity. Phase 3 hardens security and adds performance features (pagination, debounce). Phase 4 stands up infrastructure and deploys. The design overhaul comes before infrastructure because it is the core deliverable and has no dependency on a live database.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Stabilize** - Pin dependencies, remove template boilerplate, resolve Radix conflicts (completed 2026-03-12)
- [x] **Phase 2: Terminal Design System** - Full terminal aesthetic with Geist Mono, black/white/cyan palette, restyled components (completed 2026-03-13)
- [x] **Phase 3: Security and Performance** - Sanitize search, lock down RLS and edge function, add pagination and debounce (completed 2026-03-13)
- [ ] **Phase 4: Infrastructure and Deploy** - Create Supabase project, seed data, configure MCP, deploy to Vercel

## Phase Details

### Phase 1: Stabilize
**Goal**: The codebase is clean, predictable, and safe to modify -- no surprise breakages from unpinned deps or dead template code
**Depends on**: Nothing (first phase)
**Requirements**: STAB-03, STAB-05, QUAL-02
**Success Criteria** (what must be TRUE):
  1. Running `npm install` on a fresh clone produces identical `node_modules` -- no version drift from "latest" specifiers
  2. No auth-related pages, protected route middleware, or theme switcher components exist in the codebase
  3. The app builds and runs locally without Radix UI console warnings or peer dependency errors
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Pin all dependencies to exact versions and remove radix-ui meta-package conflict (STAB-03, QUAL-02)
- [ ] 01-02-PLAN.md — Delete Supabase auth template boilerplate and theme switcher, update layout.tsx and page.tsx (STAB-05)

### Phase 2: Terminal Design System
**Goal**: The entire UI presents a cohesive terminal aesthetic -- monospace font, black/white/cyan only, sharp corners, monochrome badges -- with proper error and loading states
**Depends on**: Phase 1
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05, DSGN-06, DSGN-07, STAB-02, STAB-04, QUAL-01
**Success Criteria** (what must be TRUE):
  1. Every visible element uses Geist Mono font, zero rounded corners, and only black/white/cyan colors -- no rainbow badges, no border-radius, no off-palette colors anywhere
  2. The app loads in dark mode by default with no theme toggle visible to the user
  3. Resource cards display as monochrome terminal listings with type/pillar labels pulled from a single shared constants file
  4. Triggering a server error or slow load shows a terminal-styled error boundary or skeleton, not a raw crash screen or blank page
  5. Pressing Cmd+K from any page focuses the search input
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Foundation: dark mode, terminal CSS palette, Geist Mono font, lib/constants.ts (DSGN-01, DSGN-02, DSGN-03, QUAL-01)
- [x] 02-02-PLAN.md — Component restyle: monochrome badges, sharp corners, Cmd+K, detail page de-rainbowed (DSGN-04, DSGN-05, DSGN-07)
- [x] 02-03-PLAN.md — Resilience: error boundaries, loading skeletons, lib/validators.ts (STAB-02, STAB-04, DSGN-06)

### Phase 3: Security and Performance
**Goal**: The app is safe to expose publicly and handles real-world usage patterns -- sanitized inputs, protected endpoints, paginated results, responsive search
**Depends on**: Phase 2
**Requirements**: SECR-01, SECR-02, SECR-03, SECR-04, PERF-01, PERF-02, STAB-01
**Success Criteria** (what must be TRUE):
  1. Typing a PostgREST filter injection payload into the search bar returns zero results or an error -- it does not alter query logic
  2. The Raindrop sync edge function rejects requests without a valid authorization header
  3. Resources display 20 per page with working next/previous navigation that preserves active filters
  4. The search input waits 300ms after the user stops typing before triggering navigation -- no per-keystroke page reloads
  5. Required environment variables are validated at startup and missing ones produce clear error messages
**Plans**: 2 plans

Plans:
- [ ] 03-01-PLAN.md — Security: PostgREST injection sanitizer, RLS DELETE policy, edge function auth, startup env validation (SECR-01, SECR-02, SECR-03, SECR-04)
- [ ] 03-02-PLAN.md — Performance: offset pagination with PaginationBar, filteredCount display, 300ms search debounce, page param reset on filter change (PERF-01, PERF-02, STAB-01)

### Phase 4: Infrastructure and Deploy
**Goal**: The application is live on a production URL with a real database, seeded content, working sync pipeline, and MCP ready for webinar demo
**Depends on**: Phase 3
**Requirements**: INFR-01, INFR-02, INFR-03, INFR-04
**Success Criteria** (what must be TRUE):
  1. The production URL loads the homepage with 20 real resources from a Supabase PostgreSQL database
  2. Five MCP demo queries execute successfully against the live database and return correct results
  3. The Raindrop sync edge function runs on its cron schedule and successfully syncs a test bookmark through the full pipeline (Raindrop fetch, Claude enrichment, database insert)
  4. The Vercel deployment has all required environment variables configured and passes a smoke test of search, filter, and detail page navigation
**Plans**: 3 plans

Plans:
- [ ] 04-01-PLAN.md — DB migrations: apply 003_rls_delete security policy, mark 002_seed as tracked (INFR-01)
- [ ] 04-02-PLAN.md — Edge function + MCP: deploy sync-raindrop, configure cron + secrets, run 5 MCP verification queries (INFR-02, INFR-03)
- [ ] 04-03-PLAN.md — Vercel deploy: create project, set env vars, deploy to production, browser smoke test (INFR-04)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Stabilize | 2/2 | Complete   | 2026-03-12 |
| 2. Terminal Design System | 3/3 | Complete   | 2026-03-13 |
| 3. Security and Performance | 2/2 | Complete   | 2026-03-13 |
| 4. Infrastructure and Deploy | 2/3 | In Progress|  |
