# CLAUDE.md — Product Builder Directory

## What This Is

A public curated directory of tools, resources, and content for product builders (PMs, Designers, Engineers building with AI). Resources are synced from Raindrop.io, enriched with Gemini AI classification, and served via a Next.js 16 + Supabase + Vercel stack.

**Production URL:** https://product-builder-directory.vercel.app

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack, Partial Prerender) |
| Database | Supabase PostgreSQL (project: `miclgfzbdzjhdurdeqmt`) |
| Styling | Tailwind CSS + shadcn/ui |
| Font | Geist Mono (only font — applied globally via `tailwind.config.ts`) |
| Deploy | Vercel (project: `product-builder-directory`) |
| Sync | Supabase Edge Function `sync-raindrop` (Deno) |
| AI classification | Gemini 2.5-flash via `generativelanguage.googleapis.com` |
| Bookmarks | Raindrop.io API (tag: `builder-dir`) |

---

## Development

```bash
npm run dev       # local server at localhost:3000
npm run build     # production build (run before deploy to check TS errors)
~/.local/bin/vercel --prod  # deploy to production
```

**Required `.env.local`:**
```
NEXT_PUBLIC_SUPABASE_URL=https://miclgfzbdzjhdurdeqmt.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<key>
```

---

## Architecture

### Key files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Homepage: hero, search, filters, resource grid |
| `app/resources/[slug]/page.tsx` | Resource detail page |
| `app/globals.css` | CSS variables, dot-grid background, animations |
| `lib/queries.ts` | All Supabase queries (`getResources`, `getResourceBySlug`, etc.) |
| `lib/constants.ts` | Shared label maps and filter arrays — single source of truth |
| `lib/validators.ts` | `validateResourceClassification` — validates AI output before DB insert |
| `lib/supabase/server.ts` | Server-side Supabase client (cookie-based) |
| `components/resource-card.tsx` | Individual resource card — links directly to `resource.url` |
| `components/resource-grid.tsx` | Featured (2-col) + all resources (3-col) with section headers |
| `components/filters.tsx` | Filter badges with `--type`/`--pillar` CLI flag labels |
| `components/search-bar.tsx` | `> ` terminal prompt input with debounce |
| `supabase/functions/sync-raindrop/index.ts` | Edge function: Raindrop → Gemini → Supabase |
| `instrumentation.ts` | Startup env var validation |

### Data flow

```
Raindrop.io ──[sync-raindrop edge fn]──> Gemini 2.5-flash ──> Supabase resources table
                                                                       │
                                                              Next.js (SSR) ──> browser
```

### Database

- Table: `resources` (25 rows as of 2026-03-13: 20 seeded + 5 from Raindrop sync)
- Migrations in `supabase/migrations/` — do NOT re-run `002_seed.sql` (already tracked)
- RLS: 4 policies active (SELECT public, INSERT/UPDATE/DELETE authenticated)
- Edge function: `sync-raindrop` v18, runs on `SYNC_SECRET` bearer auth + optional cron `0 */6 * * *`

---

## Design System

**Aesthetic: Terminal UI** — genuine CLI session rendered as a web page. Bold through scale and hierarchy, not effects.

### Rules

- **Font:** Geist Mono everywhere. No other fonts.
- **Colors:** Black/white/cyan only. Cyan (`hsl(180 100% 50%)`) = primary, used sparingly (prompts, active states, featured borders, cursor).
- **Corners:** `rounded-none` everywhere — no exceptions.
- **Background:** Off-black `hsl(0 0% 2%)` with subtle 28px dot-grid via CSS `radial-gradient`.
- **Cards:** `hsl(0 0% 5%)` solid — opaque so cards sit above the dot grid.
- **Dark mode:** Forced static (`<html className="dark">`) — no toggle.

### Terminal patterns in use

| Element | Pattern |
|---------|---------|
| Hero title | `clamp(3.5rem, 11vw, 9rem) font-black uppercase leading-[0.85]` stacked |
| Blinking cursor | `.cursor-blink::after { content: '_'; animation: cursor-blink step-end infinite }` |
| Search input | `> ` cyan prompt prefix + raw `<input>` |
| Filter labels | `--type`, `--pillar`, `--level`, `--price` (CLI flag style, font-mono) |
| Section headers | `// featured ──────` (comment + rule line) |
| Result count | `// 25 resources found` |
| Card meta | `[TOOL → DELIVERY]` combined badge + `[FREE]`/`[PAID]` right-aligned |
| Tags | `#tag1  #tag2  #tag3` inline monospace (no pill badges) |
| Empty state | `// no resources matched your query` |
| Footer | `// curated by Mario Miletta` |

### What NOT to do

- No glassmorphism, no gradient text, no neon glow
- No `rounded-xl`, `rounded-full`, or any non-zero border radius
- No additional fonts — Geist Mono only
- No rainbow/off-palette colors (no blue, purple, green, orange in components)
- No card-inside-card nesting
- Don't re-add the "by author" line in resource cards
- Don't link resource cards to `/resources/[slug]` — they link directly to `resource.url` with `target="_blank"`

---

## Shared Constants (`lib/constants.ts`)

All label maps and filter arrays live here. Import from here, never define locally:

```ts
TYPE_LABELS, PILLAR_LABELS, TYPE_BADGE_CLASSES  // display labels
TYPES, PILLARS, LEVELS                           // filter option arrays
```

---

## Edge Function

**Location:** `supabase/functions/sync-raindrop/index.ts`

**Auth:** Requires `Authorization: Bearer <SYNC_SECRET>` header. No JWT validation (custom auth).

**Secrets required in Supabase Dashboard:**
- `RAINDROP_TOKEN` — Raindrop.io API token
- `GEMINI_API_KEY` — Google AI Studio key
- `SUPABASE_URL` — project URL
- `SUPABASE_SERVICE_ROLE_KEY` — service role key
- `SYNC_SECRET` — shared secret (must match Vercel env var)

**Deploy:**
```bash
# Via Supabase MCP (preferred):
mcp__supabase__deploy_edge_function(project_id="miclgfzbdzjhdurdeqmt", name="sync-raindrop", ...)
```

---

## MCP Tools Available

Use Supabase MCP directly — don't ask the user to run queries manually:

- `mcp__supabase__execute_sql` — run SQL queries (project_id: `miclgfzbdzjhdurdeqmt`)
- `mcp__supabase__deploy_edge_function` — deploy edge functions
- `mcp__supabase__apply_migration` — apply SQL migrations
- `mcp__supabase__list_tables` — inspect schema

---

## Patterns

### Server queries
All DB queries are async server functions in `lib/queries.ts`. Use `createClient()` from `lib/supabase/server.ts` (never the browser client in server components).

### Search sanitization
`sanitizeSearch()` in `lib/queries.ts` strips PostgREST injection characters before query. Always use it on user input.

### URL-based state
Search, filters, and pagination are URL params — no client state. Components read `useSearchParams()` and push to router.

### Pagination
`PAGE_SIZE = 20` in `lib/queries.ts`. `PaginationBar` reads `currentPage` / `totalPages` from `getResources()` response.
