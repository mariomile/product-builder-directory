# Codebase Concerns

**Analysis Date:** 2026-03-12

## Tech Debt

**Template boilerplate not cleaned up:**
- Issue: The project was scaffolded from the Supabase Next.js starter template. A large amount of unused template code remains: tutorial components, deploy button, env-var warning, hero component, logo SVGs, protected pages, and auth flows. The SPEC explicitly states auth is NOT in MVP scope, yet full auth pages and middleware exist.
- Files:
  - `components/tutorial/code-block.tsx` (61 lines)
  - `components/tutorial/connect-supabase-steps.tsx` (62 lines)
  - `components/tutorial/fetch-data-steps.tsx` (163 lines)
  - `components/tutorial/sign-up-user-steps.tsx` (91 lines)
  - `components/tutorial/tutorial-step.tsx` (30 lines)
  - `components/deploy-button.tsx` (25 lines)
  - `components/env-var-warning.tsx` (20 lines)
  - `components/auth-button.tsx` (29 lines)
  - `components/hero.tsx` (44 lines)
  - `components/next-logo.tsx` (46 lines)
  - `components/supabase-logo.tsx` (102 lines)
  - `app/protected/page.tsx`
  - `app/protected/layout.tsx`
  - `app/auth/login/page.tsx`
  - `app/auth/sign-up/page.tsx`
  - `app/auth/sign-up-success/page.tsx`
  - `app/auth/forgot-password/page.tsx`
  - `app/auth/update-password/page.tsx`
  - `app/auth/error/page.tsx`
  - `app/auth/confirm/route.ts`
  - `components/login-form.tsx`
  - `components/sign-up-form.tsx`
  - `components/forgot-password-form.tsx`
  - `components/update-password-form.tsx`
  - `components/logout-button.tsx`
- Impact: ~673 lines of unused template code inflates the codebase, confuses contributors, and creates a false sense that auth is implemented. The protected layout still says "Next.js Supabase Starter" in the nav.
- Fix approach: Delete the entire `components/tutorial/` directory, all auth-related components (`login-form.tsx`, `sign-up-form.tsx`, `forgot-password-form.tsx`, `update-password-form.tsx`, `logout-button.tsx`), unused template components (`deploy-button.tsx`, `env-var-warning.tsx`, `hero.tsx`, `next-logo.tsx`, `supabase-logo.tsx`), and the `app/protected/` and `app/auth/` directories. Keep only `auth-button.tsx` if auth is planned for a future phase.

**Duplicated label maps across components:**
- Issue: `typeLabels` and `pillarLabels` are defined identically in both `components/resource-card.tsx` and `app/resources/[slug]/page.tsx`. The `typeColors` map lives only in `resource-card.tsx`. Filter option arrays in `components/filters.tsx` duplicate the same enum values again.
- Files:
  - `components/resource-card.tsx` (lines 6-39)
  - `app/resources/[slug]/page.tsx` (lines 11-31)
  - `components/filters.tsx` (lines 7-33)
- Impact: Adding a new resource type or pillar requires changes in 3+ files. Easy to miss one, causing inconsistent UI labels.
- Fix approach: Create a shared `lib/constants.ts` file with all enum label maps, color maps, and filter option arrays. Import from that single source of truth everywhere.

**Unpinned critical dependencies using `latest`:**
- Issue: `package.json` specifies `"latest"` for `@supabase/ssr`, `@supabase/supabase-js`, and `next`. This means builds are non-reproducible and can break on any deploy if a major version ships.
- Files: `package.json` (lines 14-15, 19)
- Impact: A new major release of Next.js or Supabase SDK could break the build with zero code changes. Especially dangerous for `next` which ships breaking changes across majors.
- Fix approach: Pin all three to specific semver ranges (e.g., `"^15.3.1"`, `"^2.x.x"`). Run `npm ls` to find current resolved versions and pin to those.

**Middleware file incorrectly named:**
- Issue: The middleware file is named `proxy.ts` at the project root. Next.js expects `middleware.ts` (or `middleware.js`) at the project root for the middleware to actually execute. The exported function is named `proxy` instead of `middleware`. This means the auth redirect logic in `lib/supabase/proxy.ts` likely never runs.
- Files: `proxy.ts` (root)
- Impact: The auth protection middleware (redirecting unauthenticated users away from protected routes) does not execute. Since auth is not in MVP scope this is currently harmless, but it is a latent bug if auth is ever enabled.
- Fix approach: Either rename to `middleware.ts` and rename the export to `middleware` when auth is needed, or delete `proxy.ts` and `lib/supabase/proxy.ts` entirely since auth is out of MVP scope.

## Security Considerations

**PostgREST filter injection in search query:**
- Risk: The `getResources` function in `lib/queries.ts` interpolates `params.search` directly into the `.or()` filter string using template literals: `` `name.ilike.%${params.search}%,...` ``. While Supabase's PostgREST layer provides some protection against direct SQL injection, the `ilike` filter value is not sanitized. Special PostgREST characters (e.g., `,`, `.`, `(`, `)`) in the search string could manipulate filter logic.
- Files: `lib/queries.ts` (line 36)
- Current mitigation: PostgREST does parameterize underlying SQL queries, limiting direct SQL injection. However, PostgREST filter syntax injection is possible.
- Recommendations: Sanitize or escape the search parameter before interpolation. Consider using Supabase's `textSearch` method with `to_tsquery` instead of `ilike` for proper full-text search, which would also leverage the existing `pg_trgm` extension and GIN indexes in the schema.

**No RLS DELETE policy:**
- Risk: The `001_init.sql` migration defines RLS policies for SELECT (public), INSERT (authenticated), and UPDATE (authenticated), but no DELETE policy. This means no one can delete resources through the Supabase client (including authenticated admins), only via service role key.
- Files: `supabase/migrations/001_init.sql` (lines 67-78)
- Current mitigation: The service role key bypasses RLS, so the edge function and MCP queries can still delete. But any future admin UI using the client SDK will not be able to delete resources.
- Recommendations: Add a DELETE policy for authenticated users, or at minimum document this as intentional.

**Edge function uses non-null assertion on env vars without validation:**
- Risk: The sync-raindrop edge function uses `Deno.env.get("...")!` with non-null assertions for all four required secrets. If any secret is missing, the function will fail with an opaque runtime error rather than a clear message.
- Files: `supabase/functions/sync-raindrop/index.ts` (lines 15-18)
- Current mitigation: None.
- Recommendations: Add explicit checks at the top of the function that throw descriptive errors if any required env var is missing.

**No rate limiting on edge function endpoint:**
- Risk: The sync-raindrop edge function accepts both GET and POST without any authentication or rate limiting. Anyone who discovers the function URL can trigger Raindrop API calls and Claude API calls (which cost money) repeatedly.
- Files: `supabase/functions/sync-raindrop/index.ts` (lines 109-114)
- Current mitigation: None.
- Recommendations: Add an authorization header check (e.g., verify a shared secret or require the Supabase service role key in the request header).

## Performance Bottlenecks

**Search triggers full navigation on every keystroke:**
- Problem: The `SearchBar` component calls `router.push()` on every `onChange` event, which triggers a full server-side re-render of the page including new Supabase queries for each keystroke.
- Files: `components/search-bar.tsx` (lines 12-25)
- Cause: No debounce on the search input. Typing "claude" fires 6 navigations and 6 database queries in rapid succession.
- Improvement path: Add a debounce (300-500ms) before triggering navigation. Use `useDeferredValue` or a simple `setTimeout`/`clearTimeout` pattern.

**Total count query runs on every filtered request:**
- Problem: `ResourceGrid` calls `getResourceCount()` alongside `getResources()` on every page load and filter change. The count query hits the entire `resources` table regardless of filters, and its result ("N resources curated for builders") is always the total unfiltered count, which is misleading when filters are active.
- Files: `components/resource-grid.tsx` (lines 15-18), `lib/queries.ts` (lines 79-87)
- Cause: The count is not filtered, and it runs a separate query every time.
- Improvement path: Either cache the total count (it changes rarely), or show the filtered count from `resources.length` instead of making a separate query.

**Sequential AI classification in sync function:**
- Problem: The sync-raindrop edge function classifies new bookmarks sequentially in a `for` loop, making one Claude API call per bookmark. With 50 bookmarks, this could take minutes.
- Files: `supabase/functions/sync-raindrop/index.ts` (lines 148-186)
- Cause: `for...of` loop with `await` inside.
- Improvement path: Use `Promise.allSettled` with a concurrency limiter (e.g., batch of 5) to classify multiple bookmarks in parallel.

## Fragile Areas

**AI classification JSON parsing:**
- Files: `supabase/functions/sync-raindrop/index.ts` (line 106)
- Why fragile: The function calls `JSON.parse(text)` on Claude's response with no validation. If Claude returns anything other than valid JSON (markdown fences, extra text, explanation), the parse fails and the bookmark is skipped. There is also no validation that the parsed object contains valid enum values matching the database schema.
- Safe modification: Wrap the parse in a try/catch (already partially handled by the outer catch). Add JSON extraction logic to strip markdown fences. Validate the parsed object's fields against known enum values before inserting.
- Test coverage: No tests exist for this function.

**Featured resources display logic:**
- Files: `components/resource-grid.tsx` (lines 37-65)
- Why fragile: The grid separates featured resources into a separate section only when no filters are active. When filters are active, featured resources appear in the main list alongside non-featured ones. But when no filters are active, featured items appear in the "Featured" section while non-featured appear in the "All Resources" section. This dual-rendering logic is easy to break when modifying the grid.
- Safe modification: Extract the featured/all split logic into a utility function with tests.
- Test coverage: No tests exist.

## Scaling Limits

**Client-side filtering via URL params with no pagination:**
- Current capacity: Works well for fewer than 100 resources.
- Limit: All resources are fetched from Supabase on every page load with no pagination. At 500+ resources, page load time and data transfer become noticeable. At 1000+, the grid will render slowly.
- Scaling path: Add server-side pagination (`.range(offset, offset + limit)` in Supabase queries). Add a "Load more" button or infinite scroll. The database indexes are already in place to support efficient paginated queries.

**Raindrop sync fetches max 50 bookmarks:**
- Current capacity: 50 bookmarks per sync invocation.
- Limit: If more than 50 bookmarks are tagged with `builder-dir` in Raindrop, the API returns only the first page. Older bookmarks beyond page 1 are never synced.
- Scaling path: Implement pagination in `fetchRaindropBookmarks()` by checking the Raindrop API's `count` field and fetching subsequent pages.

## Dependencies at Risk

**`radix-ui` meta-package alongside individual Radix packages:**
- Risk: `package.json` includes both `"radix-ui": "^1.4.3"` (a meta-package) and individual Radix packages like `@radix-ui/react-checkbox`, `@radix-ui/react-dropdown-menu`, etc. This creates potential version conflicts and unnecessary bundle bloat.
- Files: `package.json` (lines 10-13, 22)
- Impact: Conflicting versions of the same primitives could cause runtime errors or inconsistent behavior.
- Migration plan: Choose one approach: either use only the `radix-ui` meta-package or only individual `@radix-ui/*` packages. Check which imports are actually used and remove the redundant dependency.

## Missing Critical Features

**No error boundary or error UI:**
- Problem: Query functions in `lib/queries.ts` throw errors directly (`if (error) throw error`). There are no React error boundaries to catch these. A Supabase outage or misconfigured env vars would show an unhandled error or blank page to users.
- Blocks: Production readiness.
- Files: `lib/queries.ts` (lines 49, 57, 73, 85)

**No loading skeleton or placeholder UI:**
- Problem: Suspense fallbacks show plain text ("Loading resources...", "Loading resource..."). There are no skeleton loaders or shimmer effects. The initial page load looks empty and then content pops in abruptly.
- Blocks: Polished user experience.
- Files: `app/page.tsx` (lines 57-59), `app/resources/[slug]/page.tsx` (lines 67-70)

**No sitemap or SEO metadata for discoverability:**
- Problem: Individual resource pages generate metadata via `generateMetadata`, which is good. However, there is no `sitemap.xml` generation, no `robots.txt`, and the root metadata uses Italian text as the description, which may not be ideal for SEO in an English-first directory.
- Blocks: Search engine discoverability.
- Files: `app/layout.tsx` (lines 11-15)

## Test Coverage Gaps

**No tests exist in the entire codebase:**
- What's not tested: Everything. No unit tests, no integration tests, no E2E tests. Zero test files, no test framework configured, no test scripts in `package.json`.
- Files: All files in `lib/`, `components/`, `app/`, `supabase/functions/`
- Risk: Any refactoring (e.g., cleaning up the duplicated label maps, adding pagination, fixing the search injection) could break existing functionality with no safety net. The AI classification JSON parsing in the edge function is particularly risky to modify without tests.
- Priority: High. At minimum, add tests for:
  1. `lib/queries.ts` - query building logic
  2. `supabase/functions/sync-raindrop/index.ts` - JSON parsing and classification validation
  3. `components/filters.tsx` - URL param manipulation
  4. `components/search-bar.tsx` - debounce behavior (once added)

---

*Concerns audit: 2026-03-12*
