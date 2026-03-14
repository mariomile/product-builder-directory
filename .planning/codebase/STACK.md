# Technology Stack

**Analysis Date:** 2026-03-12

## Languages

**Primary:**
- TypeScript ^5 - All application code (frontend, server components, edge functions)

**Secondary:**
- SQL (PostgreSQL) - Database schema and migrations (`supabase/migrations/*.sql`)

## Runtime

**Environment:**
- Node.js (version not pinned; no `.nvmrc` or `.node-version` present)
- Deno - Supabase Edge Functions runtime (`supabase/functions/sync-raindrop/index.ts`)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js (latest) - Full-stack React framework, App Router with Server Components
- React ^19.0.0 - UI library
- React DOM ^19.0.0 - DOM rendering

**UI:**
- Tailwind CSS ^3.4.1 - Utility-first CSS framework
- shadcn/ui (new-york style) - Component library built on Radix UI primitives
- Radix UI - Headless UI primitives (checkbox, dropdown-menu, label, slot)
- Lucide React ^0.511.0 - Icon library
- next-themes ^0.4.6 - Dark/light theme switching
- tailwindcss-animate ^1.0.7 - Animation utilities for Tailwind
- class-variance-authority ^0.7.1 - Variant-based component styling
- clsx ^2.1.1 - Conditional className utility
- tailwind-merge ^3.3.0 - Merge Tailwind classes without conflicts

**Build/Dev:**
- ESLint ^9 with eslint-config-next 15.3.1 - Linting (flat config format)
- PostCSS ^8 with autoprefixer ^10.4.20 - CSS processing
- TypeScript ^5 - Type checking

**Testing:**
- Not configured - No test framework detected

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` (latest) - Supabase client for database queries and auth
- `@supabase/ssr` (latest) - Supabase server-side rendering helpers (cookie-based auth)
- `next` (latest) - Application framework

**Infrastructure:**
- `radix-ui` ^1.4.3 - UI primitive components
- `next-themes` ^0.4.6 - Theme management via class attribute

## Configuration

**Environment:**
- `.env.example` present - Documents required env vars
- Required vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Edge function secrets (set via Supabase Dashboard): `RAINDROP_TOKEN`, `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

**TypeScript:**
- Config: `tsconfig.json`
- Target: ES2017
- Module: ESNext with bundler resolution
- Strict mode: enabled
- Path alias: `@/*` maps to project root (`"./*"`)

**Tailwind:**
- Config: `tailwind.config.ts`
- Dark mode: class-based (`darkMode: ["class"]`)
- CSS variables for theming via HSL values (shadcn/ui pattern)
- Global CSS: `app/globals.css`

**shadcn/ui:**
- Config: `components.json`
- Style: new-york
- RSC: enabled
- Icon library: lucide
- Aliases: `@/components`, `@/components/ui`, `@/lib`, `@/hooks`

**ESLint:**
- Config: `eslint.config.mjs` (flat config via FlatCompat)
- Extends: `next/core-web-vitals`, `next/typescript`

**PostCSS:**
- Config: `postcss.config.mjs`
- Plugins: tailwindcss, autoprefixer

**Next.js:**
- Config: `next.config.ts`
- `cacheComponents: true` enabled

**Build Commands:**
```bash
npm run dev       # next dev
npm run build     # next build
npm run start     # next start
npm run lint      # eslint .
```

## Platform Requirements

**Development:**
- Node.js (recent LTS recommended)
- npm
- Supabase project (for database + auth)

**Production:**
- Vercel (detected via `process.env.VERCEL_URL` in `app/layout.tsx`)
- Supabase hosted instance (PostgreSQL + Auth + Edge Functions)

---

*Stack analysis: 2026-03-12*
