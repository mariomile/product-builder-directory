# Product Builder Directory

## What This Is

A deployed, terminal-styled directory of tools and resources for product builders — people who combine product management, design, and engineering using AI (Claude Code, Cursor, v0, etc.) to do discovery, design, and delivery autonomously. The directory is live at production, features a cohesive black/white/cyan terminal aesthetic, and is backed by a Supabase database with a Raindrop-powered sync pipeline. Built with Next.js 16 + Supabase + Vercel.

## Core Value

Users can quickly find the right tool or resource for their product building workflow, filtered by what they need (pillar, type, level), with expert takes that explain *why* to use each resource.

## Requirements

### Validated

<!-- Shipped in v1.0 -->

- ✓ Homepage displays resource grid with responsive layout — existing (pre-v1.0)
- ✓ Search bar with full-text search via URL params — existing (pre-v1.0)
- ✓ Filter by resource type (tool, course, article, etc.) — existing (pre-v1.0)
- ✓ Filter by pillar (discovery, design, delivery, strategy, stack, meta_skill) — existing (pre-v1.0)
- ✓ Resource detail page at /resources/[slug] with expert take — existing (pre-v1.0)
- ✓ Raindrop sync edge function with AI enrichment — v1.0 (Gemini 2.5 Flash)
- ✓ All dependencies pinned to exact versions (STAB-03) — v1.0
- ✓ Supabase auth boilerplate removed (STAB-05) — v1.0
- ✓ Terminal design system: Geist Mono, black/white/cyan, --radius: 0rem (DSGN-01, DSGN-02, DSGN-03) — v1.0
- ✓ Dark mode forced as default, no toggle (DSGN-03) — v1.0
- ✓ Monochrome resource cards, sharp-cornered shadcn primitives (DSGN-04, DSGN-05) — v1.0
- ✓ Loading skeletons + error boundaries with terminal styling (DSGN-06, STAB-02) — v1.0
- ✓ Cmd+K keyboard shortcut focuses search (DSGN-07) — v1.0
- ✓ AI classification schema validated before DB insert (STAB-04) — v1.0
- ✓ Search query sanitized against PostgREST injection (SECR-01) — v1.0
- ✓ RLS DELETE policy on resources table (SECR-02) — v1.0
- ✓ Sync edge function requires Authorization header (SECR-03) — v1.0
- ✓ Required env vars validated at Next.js startup (SECR-04) — v1.0
- ✓ Pagination at 20 items/page with URL-based navigation (PERF-01) — v1.0
- ✓ Filtered result count displayed (not global total) (PERF-02) — v1.0
- ✓ 300ms search debounce with page reset on filter change (STAB-01) — v1.0
- ✓ Label maps extracted to shared lib/constants.ts (QUAL-01) — v1.0
- ✓ Radix UI package conflicts resolved (QUAL-02) — v1.0
- ✓ Supabase project live (EU region), migrations applied, 25 resources seeded (INFR-01) — v1.0
- ✓ Supabase MCP configured and verified with 5 demo queries (INFR-02) — v1.0
- ✓ Raindrop sync edge function deployed with cron schedule (INFR-03) — v1.0
- ✓ App deployed to Vercel with production URL, smoke test passing (INFR-04) — v1.0

### Active

<!-- Requirements for next milestone -->

- [ ] j/k keyboard navigation through resource cards (UXP-01)
- [ ] "Newly added" badge for resources created in last 14 days (UXP-02)
- [ ] Empty state with suggestions when zero results (UXP-03)
- [ ] Accessible filter controls with ARIA roles and keyboard handlers (UXP-04)
- [ ] Back navigation preserves filter state (UXP-05)
- [ ] Expand to 50+ curated resources (CONT-01)
- [ ] Pillar-based landing pages (CONT-02)

### Out of Scope

| Feature | Reason |
|---------|--------|
| User authentication / accounts | Public browse-only directory — no value |
| Favorites / bookmarks | Requires auth |
| User ratings / comments / upvotes | Undermines "curated by experts" positioning |
| AI-powered personalized recommendations | Overkill for 20–200 resources |
| Newsletter / email capture | Not the product's job |
| Sponsored / promoted listings | Destroys trust in curation |
| Complex sort controls | Curation IS the sort order |
| Resource submission form | Ingestion controlled via Raindrop |
| Dark mode toggle | Terminal aesthetic forces dark mode |
| About / Blog pages | Not needed |
| Mobile app | Web-first |

## Context

- **Current state:** v1.0 shipped 2026-03-13. Live at https://product-builder-directory.vercel.app. 25 seeded resources, Gemini 2.5 Flash sync pipeline running, Supabase MCP verified for webinar demo.
- **Webinar:** March 17, 2026 — live MCP queries + Raindrop sync pipeline demo.
- **Tech stack:** Next.js 16 + Supabase (EU region) + Vercel + shadcn/ui + Tailwind + Geist Mono. ~1,995 TypeScript/TSX LOC.
- **Known gaps:** Pagination uses offset (not cursor-based) — fine for 200 resources, revisit if scale grows. Lint failing due to pre-existing ESLint 9 circular structure bug (not caused by v1.0 work).
- **6 Pillars:** Discovery con AI, Design con AI, Delivery con AI, Product Strategy, Stack & Tools, Meta-skill.
- **Resource types:** tool, course, article, newsletter, book, podcast, video, community, x_post, framework.

## Design Direction

- **Aesthetic:** Terminal-inspired but polished — sharp edges, no rounded corners, text-forward
- **Typography:** Geist Mono everywhere
- **Palette:** Black and white only, with cyan as the single accent color
- **Personality:** Impressive through restraint and precision. Resources feel like directory listings. Search feels like typing a command.
- **NOT:** AI slop (no glassmorphism, no gradients, no neon glow).

## Constraints

- **Tech stack**: Next.js 16 + Supabase + Vercel + shadcn/ui + Tailwind CSS — keep this stack
- **Font**: Geist Mono only
- **Colors**: Black, white, and cyan only — no other colors
- **Database**: Supabase PostgreSQL (EU region, `product-builder-directory` project)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Terminal-inspired design | Authentic to the product builder audience who live in CLIs | ✓ Good — distinctive, fast to ship, zero design ambiguity |
| Geist Mono everywhere | Bundled with Next.js, modern monospace, highly readable | ✓ Good — `.variable` on body, Tailwind `font-mono` via CSS var |
| Fix all flagged security concerns | Ship safe and polished for webinar demo | ✓ Good — all 4 vectors closed in Phase 3 |
| Supabase MCP in scope | Core to the webinar demo flow | ✓ Good — 5 demo queries verified live |
| Design before infrastructure (Phase 2 → 4) | Design is core deliverable with no DB dependency | ✓ Good — prevented blocking deploy on design polish |
| Gemini 2.5 Flash for AI classification | Claude Haiku unavailable to new Anthropic users at time of deploy | ✓ Good — `responseMimeType: application/json` + 2048 token limit for reliable structured output |
| Offset pagination (not cursor-based) | Simpler, URL-friendly, adequate for 200-resource scale | ✓ Good — count:exact + .range() returns count in single round-trip via Content-Range header |
| lib/constants.ts zero-import rule | Edge-function safety and circular dependency prevention | ✓ Good — lib/validators.ts also kept zero-import for same reason |
| instrumentation.ts env validation | Crash at startup with clear error vs silent failure at runtime | ✓ Good — NEXT_RUNTIME guard prevents server/client split issues |

---
*Last updated: 2026-03-13 after v1.0 milestone*
