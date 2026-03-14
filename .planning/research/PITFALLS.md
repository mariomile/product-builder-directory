# Domain Pitfalls

**Domain:** Product builder directory -- design overhaul + security hardening + deployment under 5-day deadline
**Researched:** 2026-03-12

## Critical Pitfalls

Mistakes that cause missed deadline, broken demo, or security exposure.

### Pitfall 1: shadcn/ui Component Cascade During Design Overhaul

**What goes wrong:** The terminal design calls for sharp edges, Geist Mono, and black/white/cyan only. But the shadcn/ui primitives (`Card`, `Badge`, `Button`, `Input`) ship with `rounded-xl`, `rounded-md`, and color variables from the default theme. Changing them piecemeal causes inconsistency -- some components get updated, others retain the rounded/colorful defaults. Worse, the `Card` component hardcodes `rounded-xl` (confirmed in `components/ui/card.tsx` line 12), and `ResourceCard` uses blue, purple, green, yellow, orange, pink, red, indigo, teal, and amber Tailwind colors across its type badges (confirmed in `components/resource-card.tsx` lines 6-17). The "Featured" badge uses amber. The Free/Paid indicators use green/orange. This is roughly 20+ color classes that all violate the black/white/cyan constraint.

**Why it happens:** Developers start the design overhaul from the page layout (header, footer, grid) which looks terminal-like quickly. Then they run out of time before reaching every Badge variant, every hover state, every dark-mode fallback in every component. The demo looks "mostly terminal" but with colorful badges that break the aesthetic.

**Consequences:** The webinar demo looks half-finished. Worse, if you modify the CSS variables in `globals.css` without updating component-level classes, you get invisible text (white-on-white) or broken contrast.

**Prevention:**
1. Start with the design tokens, not the layout. Redefine the shadcn CSS variables in `globals.css` first (background, foreground, card, border, accent = cyan). Override `rounded-xl` to `rounded-none` in every `ui/` component file.
2. Replace the `typeColors` map in `resource-card.tsx` with a single monochrome style (e.g., `border border-cyan-500 text-cyan-500 bg-transparent`). One color, all types. Differentiate by label text, not color.
3. Audit every `ui/` component for `rounded-*` classes and non-monochrome colors before touching any page-level layout.

**Detection:** Search the codebase for `rounded-`, `bg-blue`, `bg-purple`, `bg-green`, `bg-yellow`, `bg-orange`, `bg-pink`, `bg-red`, `bg-indigo`, `bg-teal`, `bg-amber`, `text-green-600`, `text-orange-600`. If any remain after the design phase, the overhaul is incomplete.

**Phase:** Must be completed first in the design overhaul phase, before any layout work.

---

### Pitfall 2: PostgREST Filter Injection in Search (Confirmed Vulnerability)

**What goes wrong:** The `getResources` function in `lib/queries.ts` (line 36) interpolates user input directly into the `.or()` filter string: `` `name.ilike.%${params.search}%,description.ilike.%${params.search}%` ``. PostgREST filter syntax uses commas, dots, and parentheses as operators. A malicious search string like `%,is_featured.eq.true,name.ilike.%` could manipulate the filter logic to return only featured resources or bypass intended filtering.

**Why it happens:** Supabase's JavaScript client makes it easy to build queries that look safe but are actually string-interpolated into PostgREST's filter syntax. The `.or()` method takes a raw string, not parameterized values.

**Consequences:** An attacker can craft search queries that manipulate which resources are returned, potentially exposing data that should be filtered out (not critical for a public directory, but embarrassing in a demo if someone tries it).

**Prevention:**
1. Sanitize the search input by escaping PostgREST special characters (`,`, `.`, `(`, `)`, `%`) before interpolation.
2. Better: Switch to Supabase's `.textSearch()` method with `to_tsquery`, which properly parameterizes the query. The database already has `pg_trgm` extension and GIN indexes set up for this.
3. At minimum, strip or reject search strings containing `,` `.` `(` `)`.

**Detection:** Try searching for `,is_featured.eq.true` in the search bar. If results change to only featured items, the injection works.

**Phase:** Security hardening phase, before deployment. This is the highest-priority security fix.

---

### Pitfall 3: Unprotected Edge Function Burning API Credits

**What goes wrong:** The `sync-raindrop` edge function (confirmed in `supabase/functions/sync-raindrop/index.ts` lines 109-114) accepts both GET and POST with zero authentication. Anyone who discovers the function URL can trigger it repeatedly. Each invocation calls the Raindrop API and potentially makes N Claude API calls (one per new bookmark, sequentially). An attacker running a loop could burn through Anthropic API credits.

**Why it happens:** Edge functions are deployed with publicly accessible URLs by default. Developers plan to "add auth later" but forget before the deadline.

**Consequences:** Financial exposure through Claude API abuse. Also, if someone triggers it during the webinar demo, it could create duplicate or garbage resources in the database (slug collisions would fail, but the error responses would be noisy).

**Prevention:**
1. Add an `Authorization` header check at the top of the function. Require the `SUPABASE_SERVICE_ROLE_KEY` or a dedicated shared secret in the `Authorization: Bearer <token>` header.
2. This is 5 lines of code -- do it before deployment, not after.
3. For the cron trigger, Supabase's built-in cron can pass the authorization header.

**Detection:** `curl -X GET https://<project>.supabase.co/functions/v1/sync-raindrop` -- if it returns a 200 with sync results instead of 401, it is unprotected.

**Phase:** Security hardening phase, must be done before deploying the edge function.

---

### Pitfall 4: Unpinned `latest` Dependencies Breaking the Build at Deploy Time

**What goes wrong:** `package.json` specifies `"latest"` for `next`, `@supabase/ssr`, and `@supabase/supabase-js` (confirmed lines 14, 15, 19). On Vercel, `npm install` resolves `latest` to whatever version is current at build time. If Next.js ships a new major version between now and March 17, the production build could fail with zero code changes. Next.js version churn is high.

**Why it happens:** The Supabase starter template ships with `latest` to always get the newest version. This is fine for initial scaffolding but dangerous for production.

**Consequences:** You push to deploy on demo day. The build fails because a new version of `@supabase/ssr` changed an API. You scramble to debug during the webinar prep window.

**Prevention:**
1. Run `npm ls next @supabase/ssr @supabase/supabase-js` to get the currently resolved versions.
2. Pin them in `package.json` to `^` ranges (e.g., `"next": "^15.3.1"`).
3. Do this before any other work. It takes 2 minutes and eliminates a category of deploy-day failures.

**Detection:** `grep '"latest"' package.json` -- if it returns results, you are exposed.

**Phase:** First task in the project, before any development begins.

---

### Pitfall 5: Missing Error Boundaries Causing Blank Screen During Demo

**What goes wrong:** All query functions in `lib/queries.ts` throw errors directly (`if (error) throw error` on lines 49, 61, 76, 85). There are no React error boundaries anywhere in the app. If Supabase is momentarily unreachable, or an env var is misconfigured, or a query fails for any reason, the user sees a blank white screen or Next.js's default error page -- not the polished terminal UI.

**Why it happens:** Error boundaries are boring to implement. Under deadline pressure, teams focus on the happy path (design, features) and assume the database will always be available. The webinar is exactly the scenario where Murphy's Law applies.

**Consequences:** During the live demo, a transient Supabase hiccup shows an ugly error page instead of the carefully crafted terminal design. The audience sees an unfinished product.

**Prevention:**
1. Add a Next.js `error.tsx` file in `app/` that matches the terminal design (monospace, black background, cyan error text -- lean into the aesthetic: `> ERROR: connection refused`).
2. Add `loading.tsx` with terminal-style skeleton (pulsing `_` cursor, `Loading resources...` in monospace).
3. These two files take 30 minutes to build and save the demo.

**Detection:** Temporarily set an invalid `SUPABASE_URL` and load the page. If you see a blank screen or Next.js default error, error boundaries are missing.

**Phase:** Design overhaul phase -- build error/loading states as part of the terminal design, not as an afterthought.

## Moderate Pitfalls

### Pitfall 6: Template Boilerplate Interfering With Design Overhaul

**What goes wrong:** The codebase contains ~673 lines of unused Supabase starter template code (confirmed in CONCERNS.md): tutorial components, auth forms, deploy button, hero component, logo SVGs, protected pages. During the design overhaul, developers waste time either (a) restyling components that should be deleted, or (b) getting confused by template imports that break after design token changes.

**Prevention:**
1. Delete all template boilerplate BEFORE starting the design overhaul. The CONCERNS.md file has the complete list of files to remove.
2. This cleanup is a prerequisite, not a parallel task. Working around dead code wastes time and creates confusion.
3. Run `npm run build` immediately after deletions to catch any broken imports.

**Phase:** First task in the design overhaul phase, before any styling work.

---

### Pitfall 7: Environment Variable Misconfiguration on Vercel Deploy

**What goes wrong:** The app requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the browser client, plus the edge function needs `RAINDROP_TOKEN`, `ANTHROPIC_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` as Supabase secrets. Common mistakes: (a) forgetting the `NEXT_PUBLIC_` prefix on Vercel, so the browser client gets `undefined`; (b) setting secrets in the Supabase dashboard but not redeploying the edge function; (c) using the development Supabase URL in production Vercel env vars.

**Prevention:**
1. Create a checklist of all 6+ env vars needed, with exact names and which platform they belong to (Vercel vs Supabase Dashboard).
2. Test the deployed app immediately after first deploy -- do not wait until demo day.
3. The edge function should validate env vars at startup with explicit checks instead of non-null assertions (currently uses `Deno.env.get("...")!` which gives opaque errors).

**Phase:** Deployment phase. Create the env var checklist before creating the Supabase project.

---

### Pitfall 8: Slug Collisions in Raindrop Sync

**What goes wrong:** The `slugify` function (line 39-45 of the edge function) generates slugs from bookmark titles. Two bookmarks with similar titles (e.g., "Claude Code Review" and "Claude Code: Review") produce the same slug `claude-code-review`. The database has a `UNIQUE` constraint on `slug`, so the second insert silently fails. During the webinar demo, if you sync bookmarks and some are "skipped" with database errors, it looks broken.

**Prevention:**
1. Append a short hash or the raindrop_id to the slug: `${slugify(title)}-${raindropId.slice(-4)}`.
2. Or catch the unique constraint error specifically and retry with a suffix.

**Phase:** Security/quality hardening phase, when fixing the edge function.

---

### Pitfall 9: Design Overhaul Breaks Dark Mode Toggle

**What goes wrong:** The app has `next-themes` installed and a `theme-switcher.tsx` component. The terminal design demands a dark aesthetic, but `next-themes` may default to light mode or system preference. If the terminal design is implemented assuming dark mode, but the theme provider defaults to light, users see a white background with dark text that does not match the terminal aesthetic at all.

**Prevention:**
1. Decide upfront: the terminal design IS dark mode. Set `defaultTheme="dark"` and `forcedTheme="dark"` in the ThemeProvider. Remove the theme switcher from the UI.
2. Or: implement the terminal design to work in both modes (black bg in dark, white bg with black text and cyan accent in light). This is more work for marginal benefit under a 5-day deadline.
3. Recommendation: force dark mode. The terminal aesthetic demands it. Saves time.

**Detection:** Load the app in a browser with system preference set to light mode. If it shows a white background with the old design, the theme is not forced.

**Phase:** Design overhaul phase, first decision before writing any CSS.

---

### Pitfall 10: Radix Meta-Package Version Conflict

**What goes wrong:** `package.json` includes both `"radix-ui": "^1.4.3"` (meta-package) and individual `@radix-ui/*` packages (`react-checkbox`, `react-dropdown-menu`, `react-label`, `react-slot`). During `npm install`, both resolve and can ship different versions of the same primitive. This causes React context mismatches where a Dropdown rendered by one version cannot communicate with a Menu rendered by another. Symptoms are subtle: components render but interactions fail silently.

**Prevention:**
1. Remove the `radix-ui` meta-package. Keep only the individual `@radix-ui/*` packages that shadcn/ui actually imports.
2. Run `npm ls | grep radix` to verify no duplicates after cleanup.

**Phase:** Before design overhaul, during dependency cleanup.

## Minor Pitfalls

### Pitfall 11: Search Debounce Not Added Before Demo

**What goes wrong:** The search bar fires a `router.push()` on every keystroke (confirmed in `components/search-bar.tsx`). During the webinar, typing "claude" triggers 6 navigations and 6 Supabase queries. The page flickers visibly as each partial result loads and replaces the previous one.

**Prevention:** Add a 300ms debounce to `SearchBar`. Use `setTimeout`/`clearTimeout` -- do not over-engineer with `useDeferredValue` which behaves differently with server components.

**Phase:** Performance fixes, can be done alongside security hardening.

---

### Pitfall 12: Italian Metadata in Production SEO

**What goes wrong:** The root `app/layout.tsx` uses Italian text in the site description (noted in CONCERNS.md). The directory targets an international (English-first) audience. Search engines will index the Italian description, confusing potential users and hurting discoverability.

**Prevention:** Update the metadata in `app/layout.tsx` to English. Set `<html lang="en">`. Takes 2 minutes.

**Phase:** Deployment phase, final polish before go-live.

---

### Pitfall 13: No Pagination Causing Slow Demo With Real Data

**What goes wrong:** The app fetches ALL resources on every page load with no `.range()` or `.limit()`. With seed data of 20 resources this is fine. But if the Raindrop sync imports 50+ resources before the demo, the page loads noticeably slower and the grid becomes unwieldy to scroll through.

**Prevention:** Add basic pagination with `.range(0, 19)` to `getResources()` and a "Load more" button. Or: keep the seed data to exactly 20 curated resources for the demo and defer pagination.

**Phase:** Feature work, but only if resource count exceeds ~30. Can be deferred if seed data is controlled.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Dependency cleanup | Build breaks from removing `latest` pins or Radix conflicts | Pin versions and test build immediately (Pitfalls 4, 10) |
| Template cleanup | Deleting files that are still imported somewhere | Run `npm run build` after deletions to catch broken imports (Pitfall 6) |
| Design overhaul | Incomplete color/border-radius replacement, dark mode confusion | Token-first approach, force dark mode, audit all ui/ components (Pitfalls 1, 9) |
| Security hardening | PostgREST injection left unfixed, edge function still open | Test the injection manually, add auth header check (Pitfalls 2, 3) |
| Edge function fixes | Slug collisions, unvalidated JSON from Claude, sequential API calls | Add raindrop_id to slug, wrap JSON.parse, use Promise.allSettled (Pitfall 8) |
| Error/loading states | Blank screen on error during live demo | Build error.tsx and loading.tsx in terminal style (Pitfall 5) |
| Deployment | Wrong env vars, wrong Supabase project URL, secrets not set | Env var checklist, immediate post-deploy smoke test (Pitfall 7) |
| Demo day | Search flickers, Italian metadata visible, too many resources | Debounce search, fix metadata, control seed data size (Pitfalls 11, 12, 13) |

## Ordering Rationale

The pitfalls above suggest a strict ordering for the 5-day window:

1. **Day 1: Cleanup and stabilize** -- Pin dependencies, delete template boilerplate, resolve Radix conflicts. These are prerequisites that prevent cascading issues.
2. **Day 2: Design tokens and component overhaul** -- Force dark mode, redefine CSS variables, strip colors and rounded corners from all ui/ components. Token-first, not layout-first.
3. **Day 3: Security hardening** -- Fix PostgREST injection, protect edge function, add env var validation, add RLS DELETE policy.
4. **Day 4: Deploy and test** -- Create Supabase project, run migrations, seed data, set all env vars, deploy to Vercel, smoke test everything.
5. **Day 5: Demo prep** -- Dry run the webinar flow, fix any visual issues found during testing, prepare MCP demo queries.

Doing security after design (not before) is deliberate: design changes are higher risk for introducing new visual bugs that need immediate feedback, while security fixes are surgical and unlikely to break the UI.

## Sources

- [Supabase RLS security flaw affecting 170+ apps (CVE-2025-48757)](https://byteiota.com/supabase-security-flaw-170-apps-exposed-by-missing-rls/)
- [Supabase RLS Complete Guide 2026](https://vibeappscanner.com/supabase-row-level-security)
- [2025 Supabase Security Best Practices from Pentests](https://github.com/orgs/supabase/discussions/38690)
- [Fixing RLS Misconfigurations in Supabase](https://prosperasoft.com/blog/database/supabase/supabase-rls-issues/)
- [Supabase Edge Function Secrets Documentation](https://supabase.com/docs/guides/functions/secrets)
- [Securing Supabase Edge Functions](https://supabase.com/docs/guides/functions/auth)
- [Supabase Row Level Security Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Direct codebase inspection: `lib/queries.ts`, `supabase/functions/sync-raindrop/index.ts`, `components/resource-card.tsx`, `components/ui/card.tsx`, `package.json`, `supabase/migrations/001_init.sql`

---

*Concerns audit: 2026-03-12*
