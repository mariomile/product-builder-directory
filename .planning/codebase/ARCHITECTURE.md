# Architecture

**Analysis Date:** 2026-03-12

## Pattern Overview

**Overall:** Next.js App Router with Server Components + Supabase BaaS

**Key Characteristics:**
- Server-first rendering: pages and data-fetching components are async Server Components
- URL-driven state: search and filter state lives in URL search params, not React state
- Two-tier data access: server-side Supabase client for pages, browser client available but unused in MVP
- Supabase Edge Function for external data ingestion (Raindrop.io sync with AI enrichment)
- Scaffolded auth layer from Supabase starter template (present but not used by the directory MVP)

## Layers

**Presentation Layer (Pages + Components):**
- Purpose: Renders UI, handles user interaction
- Location: `app/` (pages/layouts), `components/` (shared components)
- Contains: React Server Components (pages, resource grid) and Client Components (search, filters)
- Depends on: Data layer (`lib/queries.ts`), UI primitives (`components/ui/`)
- Used by: End users via browser

**Data Access Layer:**
- Purpose: Queries Supabase PostgreSQL, returns typed data
- Location: `lib/queries.ts`
- Contains: All database query functions (`getResources`, `getResourceBySlug`, `getRelatedResources`, `getResourceCount`)
- Depends on: Supabase server client (`lib/supabase/server.ts`)
- Used by: Server Components in `app/`

**Supabase Client Layer:**
- Purpose: Creates authenticated Supabase clients for server and browser contexts
- Location: `lib/supabase/server.ts` (server), `lib/supabase/client.ts` (browser), `lib/supabase/proxy.ts` (middleware)
- Contains: Client factory functions with cookie-based auth
- Depends on: `@supabase/ssr`, environment variables
- Used by: `lib/queries.ts`, `app/auth/` routes, `proxy.ts` middleware

**Edge Function Layer:**
- Purpose: Ingests external bookmarks from Raindrop.io, enriches with Claude AI, inserts into database
- Location: `supabase/functions/sync-raindrop/index.ts`
- Contains: Deno-based edge function with Raindrop API fetch, Claude classification, Supabase insert
- Depends on: Raindrop.io API, Anthropic API, Supabase service role client
- Used by: Cron scheduler (every 6 hours) or manual invocation

**UI Primitives Layer:**
- Purpose: Reusable, styled design system components via shadcn/ui
- Location: `components/ui/`
- Contains: `badge.tsx`, `button.tsx`, `card.tsx`, `checkbox.tsx`, `dropdown-menu.tsx`, `input.tsx`, `label.tsx`
- Depends on: Radix UI, `class-variance-authority`, Tailwind CSS
- Used by: All presentation components

## Data Flow

**Homepage Browse Flow:**

1. User visits `/` (optionally with search params like `?type=tool&pillar=delivery`)
2. `app/page.tsx` (Server Component) receives `searchParams` as a Promise
3. `ResourceGridWrapper` awaits the promise, passes params to `ResourceGrid`
4. `ResourceGrid` calls `getResources(searchParams)` and `getResourceCount()` in parallel
5. `getResources` builds a Supabase query with conditional `.eq()` / `.or()` filters
6. Results render as `ResourceCard` components in a responsive grid
7. Featured resources display in a separate section when no filters are active

**Search/Filter Flow (Client-Side Navigation):**

1. `SearchBar` and `Filters` are `"use client"` components
2. User types in search or clicks a filter badge
3. Component reads current `searchParams` via `useSearchParams()`
4. Builds new URL params (toggle on/off for filters, set/delete for search)
5. Calls `router.push("/?newParams")` inside `startTransition()`
6. Next.js re-renders the page Server Component with new search params
7. Suspense fallback shows while data loads

**Resource Detail Flow:**

1. User clicks a `ResourceCard` link to `/resources/[slug]`
2. `app/resources/[slug]/page.tsx` renders with Suspense boundary
3. `ResourceDetail` async component awaits params, calls `getResourceBySlug(slug)`
4. If not found, calls `notFound()` (Next.js 404)
5. Fetches related resources via `getRelatedResources(pillar, slug)` (same pillar, limit 4)
6. Renders detail page with badges, expert take, description, tags, CTA button, and related grid

**Raindrop Sync Flow (Background):**

1. Cron or manual HTTP request hits Supabase Edge Function
2. Function fetches bookmarks tagged `builder-dir` from Raindrop.io API
3. Checks existing `raindrop_id` values in DB to skip duplicates
4. For each new bookmark, calls Claude Haiku API with classification prompt
5. Claude returns JSON: `{ type, pillar, level, expert_take, tags }`
6. Function inserts enriched resource into `resources` table

**State Management:**
- No client-side state store (no Redux, Zustand, Context)
- All filter/search state is URL search params
- Server Components fetch fresh data on each navigation
- `useTransition` provides loading state during client-side navigations

## Key Abstractions

**Resource:**
- Purpose: Core domain entity -- a curated tool, article, course, etc. for product builders
- Type definition: `lib/queries.ts` (exported `Resource` type)
- Database schema: `supabase/migrations/001_init.sql`
- Fields: `id`, `slug`, `name`, `url`, `description`, `type` (enum), `pillar` (enum), `tags` (array), `level` (enum), `author`, `expert_take`, `language`, `is_free`, `is_featured`, `logo_url`, `raindrop_id`

**Supabase Client Factory:**
- Purpose: Provides correctly configured Supabase clients for different execution contexts
- Server: `lib/supabase/server.ts` -- uses `cookies()` from `next/headers`
- Browser: `lib/supabase/client.ts` -- uses `createBrowserClient`
- Middleware: `lib/supabase/proxy.ts` -- session refresh with `getClaims()`
- Pattern: Always create a new client per request (required for Fluid compute)

**Label Maps (typeLabels, pillarLabels, typeColors):**
- Purpose: Map database enum values to display strings and colors
- Defined in: `components/resource-card.tsx`, `app/resources/[slug]/page.tsx`, `components/filters.tsx`
- Pattern: `Record<string, string>` objects (duplicated across files)

## Entry Points

**Web Application:**
- Location: `app/layout.tsx` (root layout), `app/page.tsx` (homepage)
- Triggers: HTTP requests to the Next.js server
- Responsibilities: Root layout sets up ThemeProvider, font, metadata. Homepage renders directory.

**Resource Detail Page:**
- Location: `app/resources/[slug]/page.tsx`
- Triggers: Navigation to `/resources/{slug}`
- Responsibilities: Dynamic metadata generation, resource detail display, related resources

**Auth Routes:**
- Location: `app/auth/login/page.tsx`, `app/auth/sign-up/page.tsx`, `app/auth/confirm/route.ts`, etc.
- Triggers: Auth flows (login, sign-up, password reset, email confirmation)
- Responsibilities: Supabase auth integration (scaffolded from starter, not actively used in directory MVP)

**Middleware (Proxy):**
- Location: `proxy.ts` (root)
- Triggers: Every matched request (excludes static assets)
- Responsibilities: Refreshes Supabase auth session, redirects unauthenticated users away from non-public routes

**Raindrop Sync Edge Function:**
- Location: `supabase/functions/sync-raindrop/index.ts`
- Triggers: Cron (every 6 hours) or manual HTTP POST/GET
- Responsibilities: Fetches Raindrop bookmarks, classifies via Claude, inserts into resources table

## Error Handling

**Strategy:** Throw-and-catch with Next.js conventions

**Patterns:**
- Query functions in `lib/queries.ts` throw on Supabase errors: `if (error) throw error`
- `app/resources/[slug]/page.tsx` catches query errors and calls `notFound()` for 404 rendering
- Edge function uses try/catch with JSON error responses: `Response.json({ error: String(err) }, { status: 500 })`
- No global error boundary or `error.tsx` files defined
- Supabase cookie `setAll` silently catches errors when called from Server Components (expected behavior)

## Cross-Cutting Concerns

**Logging:** None configured. No logging framework, no structured logging. Edge function errors return in response body.

**Validation:** Minimal. Database enums enforce valid `type`, `pillar`, `level` values. No input validation on search params. Claude AI classification output is `JSON.parse`d without schema validation.

**Authentication:** Supabase Auth scaffolded but not enforced for the directory. Middleware in `proxy.ts` checks auth and redirects unauthenticated users from non-public routes, but the homepage (`/`) and `/resources/[slug]` are accessible without auth. RLS policy on `resources` table allows public SELECT.

**Theming:** `next-themes` ThemeProvider with system default. `ThemeSwitcher` component in nav. Dark mode supported via Tailwind CSS `dark:` variants.

---

*Architecture analysis: 2026-03-12*
