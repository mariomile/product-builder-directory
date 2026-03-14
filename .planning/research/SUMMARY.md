# Project Research Summary

**Project:** Product Builder Directory (Douala)
**Domain:** Curated resource directory with terminal-style design system
**Researched:** 2026-03-12
**Confidence:** HIGH

## Executive Summary

This project is a curated resource directory for product builders, built on Next.js + Supabase + shadcn/ui, that needs a terminal-style design overhaul, security hardening, and deployment -- all within a 5-day window before a March 17 webinar. The existing MVP already has working search, filters, resource cards, detail pages, SEO metadata, and an AI-powered ingestion pipeline (Raindrop.io + Claude). The core work is purely presentational (CSS variables + component modifications) plus surgical security fixes, not a rebuild.

The recommended approach is a **token-first, top-down transformation**: redefine CSS variables in `globals.css` to a strict black/white/cyan palette with `--radius: 0rem`, swap the font to Geist Mono, force dark mode, then refine individual components. This single change propagates to ~70% of the UI instantly because shadcn/ui components already consume CSS variables via Tailwind classes. The remaining 30% is manual cleanup of hardcoded Tailwind colors (20+ color classes in `resource-card.tsx` alone) and removal of `rounded-*` classes in UI primitives. No new packages are needed.

The key risks are: (1) incomplete color migration leaving rainbow badges in an otherwise monochrome UI during the demo, (2) a confirmed PostgREST filter injection vulnerability in the search function, (3) an unprotected edge function that could burn Anthropic API credits, and (4) unpinned `"latest"` dependencies that could break the build on deploy day. All four are preventable with specific, low-effort fixes detailed in the research. The strict ordering -- cleanup first, design tokens second, security third, deploy fourth -- is critical to avoid cascading issues under the tight deadline.

## Key Findings

### Recommended Stack

No new packages required. The terminal aesthetic is achieved entirely through configuration and styling changes to the existing stack.

**Core technologies (all already installed):**
- **Tailwind CSS 3.4+**: Utility-first styling -- configure theme for terminal palette, override `fontFamily.sans` with mono
- **shadcn/ui (new-york style)**: Component primitives -- modify CSS variables and remove hardcoded rounded/shadow classes
- **Geist Mono via next/font/google**: Monospace typography everywhere -- replaces Geist sans in layout.tsx
- **tailwindcss-animate**: Already installed -- use for cursor-blink animation
- **next-themes**: Already installed -- force `defaultTheme="dark"` and `forcedTheme="dark"`, remove theme switcher

**Critical version requirement:** Pin `next`, `@supabase/ssr`, and `@supabase/supabase-js` from `"latest"` to `^` ranges immediately. Remove the `radix-ui` meta-package to prevent version conflicts with individual `@radix-ui/*` packages.

### Expected Features

**Must have (table stakes -- missing today):**
- Search debounce (300ms) -- current per-keystroke navigation is visibly broken
- Pagination -- fetches ALL resources in one query, breaks at scale
- Error boundaries (`error.tsx`) -- no error handling, raw crash screens during failures
- Loading skeletons -- text-only loading state gives no spatial preview
- Terminal-style design overhaul -- this IS the milestone's identity and launch hook

**Should have (differentiators, low effort):**
- Cmd+K keyboard shortcut -- instant "power tool" signal, fits terminal metaphor
- "Newly added" indicator -- shows directory is alive and curated
- Empty state with filter suggestions -- prevents dead-end browsing

**Defer to next milestone:**
- j/k vim-style keyboard navigation (needs focus management)
- Result counts per filter option (additional Supabase queries)
- Accessible ARIA roles on filters (not blocking launch)
- Pillar landing pages (SEO value but not demo-critical)
- Back navigation preserving filter state

**Anti-features (explicitly do NOT build):**
- User accounts/auth, ratings/comments, AI recommendations, newsletter signup, sponsored listings, complex sort controls, submission forms

### Architecture Approach

The architecture strategy is **CSS variable override + in-place component modification**. The existing shadcn/ui setup already uses CSS custom properties as single source of truth. The transformation flows top-down: `globals.css` variables cascade to `tailwind.config.ts` mappings, to `components/ui/*.tsx` primitives, to feature components, to page layouts. Data flow is unchanged -- this is purely presentational. A new `lib/constants.ts` file should be created to deduplicate label maps currently scattered across 3 files.

**Major components and modification scope:**
1. **globals.css** (HEAVY) -- Redefine entire palette to black/white/cyan, set `--radius: 0rem`, add terminal utility classes
2. **layout.tsx** (MEDIUM) -- Swap Geist to Geist Mono, force dark theme
3. **components/ui/*.tsx** (LIGHT each) -- Remove hardcoded `rounded-*` and `shadow` classes from card, badge, button, input
4. **resource-card.tsx** (HEAVY) -- Replace entire `typeColors` rainbow map with monochrome `[TYPE]` prefix pattern
5. **search-bar.tsx** (MEDIUM) -- Add terminal prompt prefix (`$`), add debounce
6. **lib/constants.ts** (NEW) -- Extract shared type/pillar label maps

### Critical Pitfalls

1. **Incomplete color migration** -- 20+ hardcoded Tailwind color classes in `resource-card.tsx` bypass CSS variables. Must audit and replace ALL of them before any layout work. Search for `bg-blue`, `bg-purple`, `bg-green`, `bg-amber`, `text-green-600`, `text-orange-600`, `rounded-full`.

2. **PostgREST filter injection in search** -- `getResources()` interpolates raw user input into `.or()` filter string. Attacker can manipulate query logic. Fix: sanitize special characters or switch to `.textSearch()` with `to_tsquery`.

3. **Unprotected edge function** -- `sync-raindrop` accepts unauthenticated requests. Anyone can trigger repeated Claude API calls. Fix: add `Authorization` header check (5 lines of code).

4. **Unpinned "latest" dependencies** -- `next`, `@supabase/ssr`, `@supabase/supabase-js` all set to `"latest"`. A new major version on deploy day breaks the build with zero code changes. Fix: pin to `^` ranges immediately.

5. **Missing error boundaries** -- All queries throw raw errors, no `error.tsx` anywhere. A transient Supabase hiccup during the webinar shows a blank screen instead of the terminal UI. Fix: add `error.tsx` and `loading.tsx` styled to match terminal aesthetic.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Stabilize and Clean

**Rationale:** Dependency and boilerplate issues must be resolved first to prevent cascading failures in all subsequent phases. This is 2 hours of work that eliminates entire categories of risk.
**Delivers:** Clean, stable codebase with pinned dependencies and no dead template code
**Addresses:** Template boilerplate removal, dependency pinning, Radix conflict resolution
**Avoids:** Pitfalls 4 (unpinned deps), 6 (template boilerplate), 10 (Radix conflicts)

### Phase 2: Terminal Design System

**Rationale:** The design overhaul is the milestone's core deliverable and highest-leverage work. CSS variable changes must come before component refinement because they propagate globally. Token-first, not layout-first.
**Delivers:** Complete terminal aesthetic -- monospace font, black/white/cyan palette, sharp corners, monochrome badges, terminal prompt search, cursor blink effects
**Addresses:** Terminal design (differentiator), loading skeletons, error boundaries (styled to match)
**Avoids:** Pitfalls 1 (incomplete cascade), 9 (dark mode toggle confusion)
**Build order within phase:** (1a) CSS variables + font swap + force dark, (1b) extract `lib/constants.ts`, (2) UI primitives cleanup, (3) feature components restyling, (4) page layouts + error/loading states

### Phase 3: UX Polish and Performance

**Rationale:** With the design system in place, address the UX bugs that would be visible during a demo. Search debounce and keyboard shortcuts reinforce the terminal identity.
**Delivers:** Debounced search, Cmd+K shortcut, "Newly added" badge, empty state guidance, basic pagination
**Addresses:** Search debounce, pagination, Cmd+K, "Newly added" indicator, empty state
**Avoids:** Pitfalls 11 (search flicker), 13 (slow load with many resources)

### Phase 4: Security Hardening

**Rationale:** Security fixes are surgical and unlikely to break the UI, so they come after design work is stable. But they MUST be done before deployment.
**Delivers:** Sanitized search input, protected edge function, slug collision fix, env var validation
**Addresses:** PostgREST injection fix, edge function auth, slug uniqueness, metadata language fix
**Avoids:** Pitfalls 2 (filter injection), 3 (API credit burn), 8 (slug collisions), 12 (Italian metadata)

### Phase 5: Deploy and Validate

**Rationale:** Deployment is the final gate. Env var misconfiguration is a known risk category that requires a checklist approach and immediate smoke testing.
**Delivers:** Production deployment on Vercel + Supabase, verified end-to-end functionality
**Addresses:** Environment variable setup, Supabase project creation, migration execution, seed data, smoke testing
**Avoids:** Pitfall 7 (env var misconfiguration)

### Phase Ordering Rationale

- **Cleanup before design:** Dead template code and unpinned deps create noise and risk during the design overhaul. Remove them first.
- **Design before security:** Design changes touch more files and have more visual feedback loops. Security fixes are surgical (5-10 lines each) and do not affect UI. Design benefits from earlier feedback.
- **Security before deploy:** Non-negotiable. The PostgREST injection and unprotected edge function must not ship to production.
- **Pagination with UX polish, not with design:** Pagination changes data fetching patterns. Keeping it separate from the design phase avoids mixing presentational and data concerns.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (UX Polish):** Pagination implementation with Supabase cursor-based pagination needs specific API research. The interaction between URL-driven filters and pagination state needs careful design.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Stabilize):** Straightforward dependency management and file deletion.
- **Phase 2 (Design System):** All patterns are well-documented in STACK.md and ARCHITECTURE.md with specific code examples. The shadcn/ui Lyra style validates the approach.
- **Phase 4 (Security):** Specific fixes are identified with exact file locations and line numbers.
- **Phase 5 (Deploy):** Standard Vercel + Supabase deployment, well-documented by both platforms.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | No new packages needed. All recommendations verified against existing codebase and official docs. Geist Mono availability confirmed on Google Fonts. |
| Features | HIGH | Feature priorities derived from codebase analysis + established directory UX patterns. Anti-features are well-reasoned given the "curated by experts" positioning. |
| Architecture | HIGH | All recommendations based on direct codebase inspection. CSS variable cascade is standard CSS spec. shadcn/ui modification patterns confirmed by official docs and Lyra style reference. |
| Pitfalls | HIGH | All critical pitfalls confirmed by codebase inspection with specific file paths and line numbers. PostgREST injection is a known attack vector with documented exploit patterns. |

**Overall confidence:** HIGH

### Gaps to Address

- **Geist Mono readability at small sizes:** Monospace fonts can be harder to read at `text-xs`. May need slight size bumps after visual testing. Low risk, easy fix.
- **Scanline effect usability:** The subtle scanline CSS overlay may hurt readability on content-heavy pages. Implement it but be ready to remove it.
- **Pagination UX with URL-driven filters:** The interaction between paginated results and shareable filter URLs needs design attention during Phase 3 planning. Cursor-based pagination is recommended over offset-based for Supabase.
- **Post-deploy performance:** Page load time (<2.5s target) is unknown until measured on production. Pagination is the primary mitigation.

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis: `globals.css`, `tailwind.config.ts`, `layout.tsx`, all `components/ui/*.tsx`, `resource-card.tsx`, `search-bar.tsx`, `filters.tsx`, `lib/queries.ts`, `package.json`, `supabase/functions/sync-raindrop/index.ts`
- [shadcn/ui Theming docs](https://ui.shadcn.com/docs/theming) -- CSS variable mechanism, --radius
- [shadcn/ui Lyra style](https://x.com/shadcn/status/1999530419125981676) -- Validates zero-radius, mono font approach
- [Next.js Font Optimization docs](https://nextjs.org/docs/app/getting-started/fonts) -- Geist_Mono import pattern
- [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Edge Function auth docs](https://supabase.com/docs/guides/functions/auth)

### Secondary (MEDIUM confidence)
- [Algolia: Search Filter UX Best Practices](https://www.algolia.com/blog/ux/search-filter-ux-best-practices)
- [Nielsen Norman Group: Filter Categories and Values](https://www.nngroup.com/articles/filter-categories-values/)
- [Supabase RLS security flaw affecting 170+ apps](https://byteiota.com/supabase-security-flaw-170-apps-exposed-by-missing-rls/)
- [2025 Supabase Security Best Practices from Pentests](https://github.com/orgs/supabase/discussions/38690)
- [SMUI terminal theme for shadcn/ui](https://github.com/statico/smui) -- Reference implementation

### Tertiary (LOW confidence)
- Scanline CSS effect -- subjective usability impact, needs testing
- Geist Mono small-size readability -- theoretical concern, needs visual validation

---
*Research completed: 2026-03-12*
*Ready for roadmap: yes*
