# Codebase Structure

**Analysis Date:** 2026-03-12

## Directory Layout

```
douala/
├── app/                        # Next.js App Router pages and layouts
│   ├── layout.tsx              # Root layout (ThemeProvider, font, metadata)
│   ├── page.tsx                # Homepage (hero, search, filters, resource grid)
│   ├── globals.css             # Global styles (Tailwind base)
│   ├── auth/                   # Auth routes (scaffolded from Supabase starter)
│   │   ├── confirm/route.ts    # Email OTP verification API route
│   │   ├── error/page.tsx      # Auth error display page
│   │   ├── forgot-password/page.tsx
│   │   ├── login/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── sign-up-success/page.tsx
│   │   └── update-password/page.tsx
│   ├── protected/              # Auth-gated pages (starter template, not used by directory)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── resources/
│       └── [slug]/page.tsx     # Resource detail page (dynamic route)
├── components/                 # Shared React components
│   ├── auth-button.tsx         # Auth UI (starter template)
│   ├── deploy-button.tsx       # Vercel deploy button (starter template)
│   ├── env-var-warning.tsx     # Env var missing warning (starter template)
│   ├── filters.tsx             # Filter badges (type, pillar, level, price) — client component
│   ├── forgot-password-form.tsx
│   ├── hero.tsx                # Hero section (unused — inlined in page.tsx)
│   ├── login-form.tsx          # Login form
│   ├── logout-button.tsx       # Logout button
│   ├── next-logo.tsx           # Next.js logo SVG (starter template)
│   ├── resource-card.tsx       # Resource card for grid display
│   ├── resource-grid.tsx       # Resource grid with featured section — server component
│   ├── search-bar.tsx          # Search input with debounced URL push — client component
│   ├── sign-up-form.tsx        # Sign-up form
│   ├── supabase-logo.tsx       # Supabase logo SVG (starter template)
│   ├── theme-switcher.tsx      # Light/dark/system theme toggle
│   ├── tutorial/               # Tutorial step components (starter template)
│   │   ├── code-block.tsx
│   │   ├── connect-supabase-steps.tsx
│   │   ├── fetch-data-steps.tsx
│   │   ├── sign-up-user-steps.tsx
│   │   └── tutorial-step.tsx
│   └── ui/                     # shadcn/ui design system primitives
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       └── label.tsx
├── lib/                        # Shared utilities and data access
│   ├── queries.ts              # All Supabase queries + Resource type definition
│   ├── utils.ts                # cn() helper, hasEnvVars check
│   └── supabase/               # Supabase client factories
│       ├── client.ts           # Browser client (createBrowserClient)
│       ├── server.ts           # Server client (createServerClient with cookies)
│       └── proxy.ts            # Middleware session refresh (updateSession)
├── supabase/                   # Supabase project config and functions
│   ├── functions/
│   │   └── sync-raindrop/
│   │       └── index.ts        # Deno edge function: Raindrop sync + AI enrichment
│   └── migrations/
│       ├── 001_init.sql        # Schema: resources table, enums, indexes, RLS
│       └── 002_seed.sql        # 20 seed resources
├── proxy.ts                    # Next.js middleware (Supabase session refresh)
├── next.config.ts              # Next.js config (cacheComponents: true)
├── tailwind.config.ts          # Tailwind CSS config with custom theme
├── tsconfig.json               # TypeScript config (strict, path aliases)
├── postcss.config.mjs          # PostCSS config (Tailwind + Autoprefixer)
├── eslint.config.mjs           # ESLint config
├── components.json             # shadcn/ui config (new-york style, aliases)
├── package.json                # Dependencies and scripts
├── .env.example                # Example env vars (existence noted, not read)
├── SPEC.md                     # Product specification
├── TODO.md                     # Next steps for handoff
├── CHECKLIST.md                # Setup checklist
└── README.md                   # Project readme
```

## Directory Purposes

**`app/`:**
- Purpose: Next.js App Router pages, layouts, and API routes
- Contains: `.tsx` page components, `route.ts` API handlers, `globals.css`
- Key files: `page.tsx` (homepage), `resources/[slug]/page.tsx` (detail page), `layout.tsx` (root layout)

**`app/auth/`:**
- Purpose: Authentication pages scaffolded from Supabase Next.js starter template
- Contains: Login, sign-up, password reset, email confirmation flows
- Key files: `confirm/route.ts` (OTP verification), `login/page.tsx`
- Note: Present but not actively used in the directory MVP

**`app/protected/`:**
- Purpose: Auth-gated area from starter template
- Contains: Protected page showing user details, tutorial steps
- Note: Starter template artifact, not part of directory functionality

**`components/`:**
- Purpose: Shared React components used across pages
- Contains: Directory-specific components (resource-card, filters, search-bar) and starter template components
- Key files: `resource-card.tsx`, `resource-grid.tsx`, `search-bar.tsx`, `filters.tsx`

**`components/ui/`:**
- Purpose: shadcn/ui design system primitives
- Contains: Low-level UI components (Badge, Button, Card, Input, etc.)
- Generated by: `npx shadcn@latest add <component>`
- Style: "new-york" variant with Tailwind CSS variables

**`components/tutorial/`:**
- Purpose: Tutorial/onboarding steps from Supabase starter template
- Contains: Code blocks and step-by-step guides
- Note: Starter template artifact, can be removed

**`lib/`:**
- Purpose: Shared utilities, data access layer, and Supabase client configuration
- Contains: Query functions, utility helpers, Supabase client factories
- Key files: `queries.ts` (all DB queries + `Resource` type), `utils.ts` (cn helper)

**`lib/supabase/`:**
- Purpose: Supabase client factories for different execution contexts
- Contains: Server client, browser client, middleware session handler
- Key files: `server.ts` (used by all server-side queries), `proxy.ts` (used by middleware)

**`supabase/`:**
- Purpose: Supabase project configuration, edge functions, and database migrations
- Contains: Edge functions (Deno), SQL migration files

**`supabase/functions/sync-raindrop/`:**
- Purpose: Deno edge function that syncs Raindrop.io bookmarks into the resources table
- Key files: `index.ts` (fetches bookmarks, classifies with Claude AI, inserts into DB)

**`supabase/migrations/`:**
- Purpose: SQL migration files for database schema and seed data
- Key files: `001_init.sql` (schema, enums, indexes, RLS), `002_seed.sql` (20 seed resources)

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root layout with ThemeProvider and global metadata
- `app/page.tsx`: Homepage -- the main user-facing entry point
- `proxy.ts`: Next.js middleware for session management

**Configuration:**
- `next.config.ts`: Next.js configuration
- `tailwind.config.ts`: Tailwind CSS theme customization
- `tsconfig.json`: TypeScript with `@/*` path alias mapping to project root
- `components.json`: shadcn/ui component generation config
- `.env.example`: Required environment variables template

**Core Logic:**
- `lib/queries.ts`: All database queries and the `Resource` type definition
- `lib/supabase/server.ts`: Server-side Supabase client factory
- `components/resource-grid.tsx`: Main data-fetching component (Server Component)
- `components/filters.tsx`: Filter UI with URL-based state management
- `components/search-bar.tsx`: Search with URL push

**Database:**
- `supabase/migrations/001_init.sql`: Full schema definition
- `supabase/migrations/002_seed.sql`: 20 seed resources

**Background Processing:**
- `supabase/functions/sync-raindrop/index.ts`: Raindrop sync edge function

## Naming Conventions

**Files:**
- kebab-case for all files: `resource-card.tsx`, `search-bar.tsx`, `sync-raindrop`
- Pages use `page.tsx`, layouts use `layout.tsx`, API routes use `route.ts` (Next.js convention)
- SQL migrations use numbered prefix: `001_init.sql`, `002_seed.sql`

**Directories:**
- kebab-case for all directories: `sync-raindrop`, `sign-up-success`
- Dynamic routes use bracket syntax: `[slug]`

**Components:**
- PascalCase exports: `ResourceCard`, `SearchBar`, `Filters`
- One component per file (primary export matches file name in PascalCase)

**Functions:**
- camelCase: `getResources`, `getResourceBySlug`, `createClient`, `handleSearch`
- Async query functions prefixed with `get`: `getResources`, `getResourceCount`

**Types:**
- PascalCase: `Resource`, `SearchParams`, `RaindropItem`, `AIClassification`
- Inline types preferred for component props: `{ resource: Resource }`

**Database:**
- snake_case for table names, columns, enums: `resources`, `expert_take`, `resource_type`
- Enum values are snake_case: `meta_skill`, `x_post`

## Where to Add New Code

**New Page:**
- Create directory under `app/` with `page.tsx`
- Example: `app/about/page.tsx` for an about page
- Use `layout.tsx` in the same directory for page-specific layout wrapping

**New Feature Component:**
- Place in `components/` with kebab-case filename
- Server Components by default; add `"use client"` directive only if needed for interactivity
- Import UI primitives from `@/components/ui/`

**New UI Primitive:**
- Use `npx shadcn@latest add <component>` to generate into `components/ui/`
- Do not manually create files in `components/ui/`

**New Database Query:**
- Add to `lib/queries.ts`
- Use `createClient()` from `@/lib/supabase/server` for server-side queries
- Return typed data using the `Resource` type or new types defined in the same file

**New Database Migration:**
- Add numbered SQL file to `supabase/migrations/`: `003_description.sql`

**New Edge Function:**
- Create directory under `supabase/functions/` with `index.ts`
- Use Deno runtime, import Supabase client from `https://esm.sh/@supabase/supabase-js@2`

**New Utility:**
- Add to `lib/utils.ts` for general utilities
- Create new file in `lib/` for domain-specific utilities

## Special Directories

**`components/ui/`:**
- Purpose: shadcn/ui generated components
- Generated: Yes (via `npx shadcn@latest add`)
- Committed: Yes
- Note: These files are owned by the project and can be customized

**`supabase/migrations/`:**
- Purpose: SQL migration files for database schema
- Generated: No (hand-written)
- Committed: Yes
- Note: Run via Supabase Dashboard SQL Editor, not via CLI migration tool

**`components/tutorial/`:**
- Purpose: Starter template tutorial components
- Generated: Yes (from Supabase Next.js starter)
- Committed: Yes
- Note: Candidate for removal -- not used by the directory MVP

**`.planning/`:**
- Purpose: GSD planning and codebase analysis documents
- Generated: Yes (by GSD tooling)
- Committed: Yes

**`.context/`:**
- Purpose: Context and planning documents
- Committed: Yes

---

*Structure analysis: 2026-03-12*
