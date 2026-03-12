# Product Builder Directory

## What This Is

A curated directory of tools, resources, and content for product builders — people who combine product management, design, and engineering using AI (Claude Code, Cursor, v0, etc.) to do discovery, design, and delivery autonomously. The directory cuts through the noise and surfaces only the best resources, tested and curated by experts. Built with Next.js 16 + Supabase + Vercel.

## Core Value

Users can quickly find the right tool or resource for their product building workflow, filtered by what they need (pillar, type, level), with expert takes that explain *why* to use each resource.

## Requirements

### Validated

<!-- Inferred from existing codebase — code is written, builds successfully -->

- ✓ Homepage displays resource grid with responsive layout — existing
- ✓ Search bar with full-text search via URL params — existing
- ✓ Filter by resource type (tool, course, article, etc.) — existing
- ✓ Filter by pillar (discovery, design, delivery, strategy, stack, meta_skill) — existing
- ✓ Combined search + filter — existing
- ✓ Resource detail page at /resources/[slug] with expert take — existing
- ✓ Featured resources section on homepage — existing
- ✓ Related resources on detail page (same pillar) — existing
- ✓ Clickable tags that filter homepage — existing
- ✓ Raindrop sync edge function with Claude AI enrichment (code written) — existing
- ✓ Supabase client setup (server + browser) — existing
- ✓ Database schema and seed data SQL files — existing
- ✓ shadcn/ui component library configured — existing

### Active

<!-- What we're building in this milestone -->

- [ ] Terminal-inspired design overhaul (Geist Mono, black/white + cyan, sharp edges)
- [ ] Fix security: PostgREST filter injection in search
- [ ] Fix security: missing RLS DELETE policy
- [ ] Fix security: unprotected edge function endpoint
- [ ] Fix security: unvalidated env vars
- [ ] Fix performance: add search debounce
- [ ] Fix performance: remove redundant count query
- [ ] Fix code quality: deduplicate label maps (currently in 3 files)
- [ ] Fix code quality: add error boundaries
- [ ] Fix code quality: add loading skeletons
- [ ] Fix code quality: validate AI classification JSON
- [ ] Add pagination (currently fetches all resources)
- [ ] Create Supabase project and run migrations
- [ ] Seed database with 20 real resources
- [ ] Configure and test Supabase MCP
- [ ] Deploy Raindrop sync edge function + cron
- [ ] Deploy to Vercel with production URL
- [ ] Webinar demo preparation (branches, dry run)

### Out of Scope

- User authentication / accounts — not needed for public directory MVP
- Favorites / bookmarks — requires auth
- Learning paths — future feature
- User ratings — requires auth
- Dark mode toggle — already scaffolded but not a priority to refine
- About/Blog pages — not needed for MVP
- Mobile app — web-first

## Context

- **Deadline:** Webinar on March 17, 2026 (5 days). Must be deployed and demo-ready.
- **Webinar demo:** Live MCP queries against the database + showing the Raindrop sync pipeline.
- **Existing code:** Full MVP code is written and builds. Missing infrastructure (Supabase project, deploy).
- **6 Pillars:** Discovery con AI, Design con AI, Delivery con AI, Product Strategy, Stack & Tools, Meta-skill.
- **Resource types:** tool, course, article, newsletter, book, podcast, video, community, x_post, framework.
- **User personas:** Sofia (PM, wants to filter and find), Luca (indie hacker, wants opinionated stack), Andrea (Head of Product, wants to standardize team tools).
- **Codebase concerns flagged:** Security issues in search/RLS, no debounce, duplicated label maps, no tests, no error boundaries.

## Design Direction

- **Aesthetic:** Terminal-inspired but polished — sharp edges, no rounded corners, text-forward
- **Typography:** Geist Mono everywhere (already bundled with Next.js/Vercel)
- **Palette:** Black and white only, with cyan as the single accent color
- **Layout:** Modern and readable, but with terminal character
- **Personality:** Impressive through restraint and precision. Resources feel like directory listings. Search feels like typing a command.
- **NOT:** AI slop (no glassmorphism, no gradients, no neon glow). The terminal metaphor is authentic, not decorative.

## Constraints

- **Tech stack**: Next.js 16 + Supabase + Vercel + shadcn/ui + Tailwind CSS — already built, don't change
- **Timeline**: Must be deployed and demo-ready by March 17, 2026
- **Database**: Supabase PostgreSQL with existing migration files
- **Font**: Geist Mono only (already available via Next.js)
- **Colors**: Black, white, and cyan only — no other colors

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Terminal-inspired design | Authentic to the product builder audience who live in CLIs | — Pending |
| Geist Mono everywhere | Bundled with Next.js, modern monospace, highly readable | — Pending |
| Fix all flagged concerns | Ship safe and polished for webinar demo | — Pending |
| Supabase MCP in scope | Core to the webinar demo flow | — Pending |

---
*Last updated: 2026-03-12 after initialization*
