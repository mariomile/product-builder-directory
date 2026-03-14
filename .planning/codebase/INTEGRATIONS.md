# External Integrations

**Analysis Date:** 2026-03-12

## APIs & External Services

**Raindrop.io (Bookmark Sync):**
- Purpose: Source of truth for resource bookmarks; tagged bookmarks are synced into the resources database
- API: REST API v1 (`https://api.raindrop.io/rest/v1/raindrops/0`)
- Auth: Bearer token via `RAINDROP_TOKEN` env secret
- Implementation: `supabase/functions/sync-raindrop/index.ts`
- Fetches bookmarks tagged `builder-dir`, filters already-synced items, inserts new ones
- Trigger: Cron every 6 hours, or manual invocation (POST/GET)

**Anthropic Claude API (AI Classification):**
- Purpose: Classifies new resources by type, pillar, level; generates expert_take descriptions
- API: Messages API (`https://api.anthropic.com/v1/messages`)
- Model: `claude-haiku-4-5-20251001`
- Auth: API key via `ANTHROPIC_API_KEY` env secret
- Implementation: `supabase/functions/sync-raindrop/index.ts` (`classifyWithClaude` function)
- Called once per new bookmark during sync; returns structured JSON classification

## Data Storage

**Database:**
- Supabase PostgreSQL
- Connection: `NEXT_PUBLIC_SUPABASE_URL` (public), `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (edge functions)
- Client (browser): `@supabase/ssr` `createBrowserClient` in `lib/supabase/client.ts`
- Client (server): `@supabase/ssr` `createServerClient` in `lib/supabase/server.ts`
- Client (edge functions): `@supabase/supabase-js` v2 via ESM import in `supabase/functions/sync-raindrop/index.ts`

**Tables:**
- `resources` - Single table storing all directory resources
  - Schema: `supabase/migrations/001_init.sql`
  - Seed data: `supabase/migrations/002_seed.sql` (20 initial resources)
  - Custom enums: `resource_type`, `resource_pillar`, `resource_level`
  - Extensions: `pg_trgm` for fuzzy text search
  - Indexes: slug, type, pillar, level, GIN on tags, trigram on name/description, partial on is_featured
  - RLS: public read, authenticated insert/update

**File Storage:**
- Not used (no Supabase Storage integration detected; `logo_url` field exists but stores external URLs)

**Caching:**
- Next.js component caching enabled (`cacheComponents: true` in `next.config.ts`)
- No external caching service

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built-in)
- Methods: Email/password sign-up and sign-in
- Email OTP verification supported (`app/auth/confirm/route.ts`)
- Password reset flow (`app/auth/forgot-password/page.tsx`, `app/auth/update-password/page.tsx`)

**Implementation:**
- Browser client: `lib/supabase/client.ts` - `createBrowserClient` for client components
- Server client: `lib/supabase/server.ts` - `createServerClient` with cookie management
- Middleware (proxy): `proxy.ts` + `lib/supabase/proxy.ts` - Session refresh via `updateSession`, redirects unauthenticated users to `/auth/login`
- Auth forms: `components/login-form.tsx`, `components/sign-up-form.tsx`, `components/forgot-password-form.tsx`, `components/update-password-form.tsx`
- Protected routes: `app/protected/` directory with its own layout

**Auth Flow:**
1. User signs up via `components/sign-up-form.tsx` (client-side Supabase `auth.signUp`)
2. Email confirmation sent; user clicks link hitting `app/auth/confirm/route.ts` (`auth.verifyOtp`)
3. Login via `components/login-form.tsx` (`auth.signInWithPassword`)
4. Middleware (`proxy.ts`) refreshes session on every request via `auth.getClaims()`
5. Unauthenticated users redirected to `/auth/login` (except `/` and `/auth/*` routes)

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, LogRocket, or similar)

**Logs:**
- Console-based only
- Edge function errors returned as JSON responses

## CI/CD & Deployment

**Hosting:**
- Vercel (detected via `process.env.VERCEL_URL` usage in `app/layout.tsx`)
- Vercel auto-generates `metadataBase` URL from `VERCEL_URL` env var

**CI Pipeline:**
- Not detected (no `.github/workflows/`, no `vercel.json`)

**Supabase Edge Functions:**
- Deployed to Supabase infrastructure
- Runtime: Deno
- Location: `supabase/functions/sync-raindrop/`

## Environment Configuration

**Required env vars (Next.js app):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Supabase anon/publishable key (public)

**Required secrets (Supabase Edge Functions, set via Dashboard):**
- `RAINDROP_TOKEN` - Raindrop.io API bearer token
- `ANTHROPIC_API_KEY` - Anthropic API key for Claude
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (admin access, bypasses RLS)

**Auto-provided:**
- `VERCEL_URL` - Set automatically by Vercel at deploy time

**Secrets location:**
- App env vars: `.env.local` (not committed; `.env.example` documents structure)
- Edge function secrets: Supabase Dashboard > Edge Functions > Secrets

## Webhooks & Callbacks

**Incoming:**
- `supabase/functions/sync-raindrop/index.ts` - Accepts POST/GET; acts as a webhook endpoint for cron-triggered or manual resource sync
- `app/auth/confirm/route.ts` - Email confirmation callback (GET with `token_hash` and `type` params)

**Outgoing:**
- None detected

---

*Integration audit: 2026-03-12*
