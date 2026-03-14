# Coding Conventions

**Analysis Date:** 2026-03-12

## Naming Patterns

**Files:**
- Components: `kebab-case.tsx` (e.g., `resource-card.tsx`, `search-bar.tsx`, `login-form.tsx`)
- UI primitives (shadcn): `kebab-case.tsx` in `components/ui/` (e.g., `button.tsx`, `card.tsx`, `badge.tsx`)
- Lib modules: `kebab-case.ts` (e.g., `queries.ts`, `utils.ts`)
- Next.js pages: `page.tsx` (App Router convention)
- Next.js layouts: `layout.tsx`
- Next.js route handlers: `route.ts`

**Functions:**
- Use `camelCase` for all functions: `getResources`, `handleLogin`, `handleSearch`, `slugify`
- React components use `PascalCase`: `ResourceCard`, `SearchBar`, `FilterGroup`, `LoginForm`
- Async data-fetching functions prefix with `get`: `getResources()`, `getResourceBySlug()`, `getRelatedResources()`, `getResourceCount()`
- Event handlers prefix with `handle`: `handleLogin`, `handleSignUp`, `handleSearch`, `handleFilter`
- Supabase client factories named `createClient` in both `lib/supabase/server.ts` and `lib/supabase/client.ts`

**Variables:**
- Use `camelCase`: `searchParams`, `activeValue`, `isPending`, `isLoading`
- Boolean state variables prefix with `is`: `isLoading`, `is_free`, `is_featured`
- Constants use `UPPER_SNAKE_CASE`: `TYPES`, `PILLARS`, `LEVELS`, `RAINDROP_TAG`, `ICON_SIZE`
- Lookup maps use `camelCase` with descriptive suffix: `typeColors`, `typeLabels`, `pillarLabels`

**Types:**
- Use `PascalCase`: `Resource`, `SearchParams`, `RaindropItem`, `AIClassification`
- Inline prop types for components (not separate interface files):
  ```typescript
  export function ResourceCard({ resource }: { resource: Resource }) {
  ```
- Use `type` keyword (not `interface`) for data shapes:
  ```typescript
  type SearchParams = { search?: string; type?: string; ... };
  ```
- UI component interfaces use `interface` + `extends` pattern (shadcn convention):
  ```typescript
  export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
      VariantProps<typeof buttonVariants> {
    asChild?: boolean;
  }
  ```

## Code Style

**Formatting:**
- No dedicated Prettier config detected; relies on ESLint and editor defaults
- Double quotes for strings in JSX and imports
- Semicolons at end of statements
- 2-space indentation
- Trailing commas in multi-line structures

**Linting:**
- ESLint 9 with flat config: `eslint.config.mjs`
- Extends `next/core-web-vitals` and `next/typescript`
- Run with: `npm run lint`

**TypeScript:**
- Strict mode enabled in `tsconfig.json`
- Non-null assertions (`!`) used for environment variables:
  ```typescript
  process.env.NEXT_PUBLIC_SUPABASE_URL!
  ```
- `as` type assertions for Supabase query results:
  ```typescript
  return data as Resource[];
  ```

## Import Organization

**Order:**
1. React / Next.js framework imports (`react`, `next/navigation`, `next/link`)
2. External library imports (`@supabase/ssr`, `lucide-react`, `next-themes`)
3. Internal UI components (`@/components/ui/...`)
4. Internal app components (`@/components/...`)
5. Internal lib modules (`@/lib/...`)
6. Relative imports (CSS files like `./globals.css`)

**Path Aliases:**
- `@/*` maps to project root (configured in `tsconfig.json`)
- Use `@/components/...` for components
- Use `@/lib/...` for library code
- Use `@/components/ui/...` for shadcn primitives

**Import Style:**
- Named exports preferred: `import { ResourceCard } from "@/components/resource-card"`
- Type-only imports used: `import type { Metadata } from "next"`
- Destructured imports from barrel files: `import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"`

## Component Patterns

**Server Components (default):**
- No directive needed; all components are server components by default
- Async server components for data fetching:
  ```typescript
  export async function ResourceGrid({ searchParams }: { ... }) {
    const resources = await getResources(searchParams);
    return ( ... );
  }
  ```
- Use `Suspense` boundaries in parent for async children:
  ```typescript
  <Suspense fallback={<div>Loading...</div>}>
    <ResourceGrid searchParams={params} />
  </Suspense>
  ```

**Client Components:**
- Mark with `"use client"` directive at file top
- Used for: interactive forms (`login-form.tsx`, `sign-up-form.tsx`), URL-driven filters (`filters.tsx`, `search-bar.tsx`), theme switching (`theme-switcher.tsx`)
- State managed with `useState` hooks
- URL state managed via `useRouter` + `useSearchParams` + `useTransition`

**Props Pattern:**
- Inline destructured props with inline type annotations (no separate Props type for simple components):
  ```typescript
  export function ResourceCard({ resource }: { resource: Resource }) {
  ```
- Spread remaining props for wrapper components:
  ```typescript
  export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  ```

**Async Params Pattern (Next.js 15+):**
- Page params and searchParams are `Promise` types, awaited inside component or wrapper:
  ```typescript
  export default function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  ```
  Then wrap in an async component:
  ```typescript
  async function ResourceGridWrapper({ searchParamsPromise }: { searchParamsPromise: Promise<SearchParams> }) {
    const params = await searchParamsPromise;
    return <ResourceGrid searchParams={params} />;
  }
  ```

## Error Handling

**Client-side forms:**
- Try/catch around async operations
- Error state via `useState<string | null>(null)`
- Display inline: `{error && <p className="text-sm text-red-500">{error}</p>}`
- Pattern:
  ```typescript
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    router.push("/protected");
  } catch (error: unknown) {
    setError(error instanceof Error ? error.message : "An error occurred");
  } finally {
    setIsLoading(false);
  }
  ```

**Server-side queries:**
- Throw on Supabase errors (let Next.js error boundary handle):
  ```typescript
  const { data, error } = await query;
  if (error) throw error;
  return data as Resource[];
  ```
- Detail pages use try/catch with `notFound()`:
  ```typescript
  try {
    resource = await getResourceBySlug(slug);
  } catch {
    notFound();
  }
  ```

**Edge functions:**
- Top-level try/catch returning JSON error responses:
  ```typescript
  catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
  ```
- Per-item error handling in batch operations with results array tracking successes/failures

**Auth route handler:**
- Redirect-based error handling: `redirect('/auth/error?error=${error?.message}')`

## Logging

**Framework:** None (no logging library installed)

**Patterns:**
- No structured logging in the codebase
- Edge function uses JSON response bodies for observability (results array with status per item)
- Use `console` only when needed for debugging; no production logging pattern established

## Comments

**When to Comment:**
- Section headers in JSX using `{/* Nav */}`, `{/* Hero */}`, `{/* Search + Filters */}`, `{/* Footer */}`
- File-level documentation blocks for edge functions (purpose, required secrets, trigger info)
- Inline comments for non-obvious behavior: `// The setAll method was called from a Server Component.`

**JSDoc/TSDoc:**
- Minimal usage; one JSDoc block on `createClient` in `lib/supabase/server.ts`
- No systematic JSDoc pattern; rely on TypeScript types for documentation

## Function Design

**Size:** Functions are small and focused; most under 30 lines

**Parameters:**
- Use object parameters for functions with multiple optional fields:
  ```typescript
  export async function getResources(params: { search?: string; type?: string; ... })
  ```
- Simple parameters for single-argument functions:
  ```typescript
  export async function getResourceBySlug(slug: string)
  ```

**Return Values:**
- Data fetching functions return typed data directly (not wrapped in result objects)
- Throw on error rather than returning error objects

## Module Design

**Exports:**
- Named exports throughout (no default exports except Next.js pages)
- Next.js pages use `export default function` (framework requirement)
- Components export a single named function: `export function ResourceCard`
- UI components (shadcn) export component + variants: `export { Button, buttonVariants }`

**Barrel Files:**
- Not used; import directly from specific files

## Styling Patterns

**Framework:** Tailwind CSS 3 with CSS variables for theming

**Component Styling:**
- Use `cn()` utility from `lib/utils.ts` for conditional/merged classes:
  ```typescript
  <div className={cn("flex flex-col gap-6", className)}>
  ```
- shadcn `cva` (class-variance-authority) for variant-based component styles:
  ```typescript
  const buttonVariants = cva("base-classes", { variants: { ... } });
  ```
- Inline Tailwind classes directly in JSX (no CSS modules, no styled-components)
- Dark mode via `dark:` prefix classes alongside light classes:
  ```typescript
  "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
  ```

**Design Tokens:**
- Colors defined as CSS variables via `hsl(var(--...))` in `tailwind.config.ts`
- Use semantic color names: `background`, `foreground`, `primary`, `muted`, `accent`, `destructive`, `border`
- Consistent spacing with Tailwind scale: `gap-2`, `gap-4`, `gap-6`, `py-8`, `px-5`
- Max content width: `max-w-6xl` for directory pages, `max-w-3xl` for detail pages

## Supabase Client Pattern

**Server-side:** Always create a fresh client per request via `await createClient()` from `@/lib/supabase/server`:
```typescript
const supabase = await createClient();
const { data, error } = await supabase.from("resources").select("*");
```

**Client-side:** Create client inline in event handlers via `createClient()` from `@/lib/supabase/client`:
```typescript
const handleLogin = async (e: React.FormEvent) => {
  const supabase = createClient();
  // ...
};
```

**Never store the Supabase client in module-level variables or React state.**

## Data Constants

**Lookup maps are defined as module-level `const` objects** using `Record<string, string>`:
```typescript
const typeLabels: Record<string, string> = {
  tool: "Tool",
  course: "Course",
  // ...
};
```

**Note:** `typeLabels` and `pillarLabels` are duplicated between `components/resource-card.tsx` and `app/resources/[slug]/page.tsx`. New code should extract shared constants to a dedicated file (e.g., `lib/constants.ts`).

---

*Convention analysis: 2026-03-12*
