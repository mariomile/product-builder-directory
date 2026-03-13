# Phase 2: Terminal Design System - Research

**Researched:** 2026-03-13
**Domain:** Next.js 16 / Tailwind CSS 3 / shadcn/ui theming, monospace typography, dark mode forcing, keyboard shortcuts, error boundaries, loading skeletons, schema validation
**Confidence:** HIGH

---

## Summary

Phase 2 is a pure front-end overhaul: no new dependencies required beyond what is already installed. Every change is a targeted surgical edit to CSS variables, Tailwind classes, and component files already in the codebase. The single riskiest area is the "forced dark mode" strategy — the approach of adding `class="dark"` statically to `<html>` in `layout.tsx` is simple and correct for this stack (Tailwind `darkMode: ["class"]`), but it must be done before any CSS variable edits or the colors will be wrong during testing.

The second major work area is constants extraction (QUAL-01). Three files duplicate `typeLabels`, `pillarLabels`, and related maps: `components/resource-card.tsx`, `app/resources/[slug]/page.tsx`, and `components/filters.tsx`. A single `lib/constants.ts` eliminates all duplication and is a prerequisite for the badge color restyle — you update one place, it takes effect everywhere.

STAB-04 (`lib/validators.ts`) is also scoped here. There is no edge function yet (Phase 4), so this is pure TypeScript: a schema definition and a validation function that will be called by the sync function in Phase 4. No runtime dependency is needed; a plain TypeScript discriminated union / type guard is sufficient. Using `zod` for inline validation is fine if it is already installed, but it is not — do not add it. Hand-roll a narrow validator with a clear error type instead.

**Primary recommendation:** Execute in this order — (1) add `dark` class to `<html>`, (2) rewrite CSS variables for terminal palette, (3) fix `--radius`, (4) remove all hardcoded rounded classes, (5) extract `lib/constants.ts`, (6) restyle badges/cards, (7) add font switch, (8) add `app/error.tsx` and `app/resources/[slug]/error.tsx`, (9) add skeleton components, (10) add Cmd+K listener, (11) add `lib/validators.ts`.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DSGN-01 | CSS variables redefined for terminal palette (black/white/cyan, --radius: 0rem) | Section: CSS Variable Rewrite |
| DSGN-02 | Geist Mono font applied globally via layout.tsx and tailwind.config.ts | Section: Font Switch |
| DSGN-03 | Dark mode forced as default, theme switcher removed | Section: Forced Dark Mode |
| DSGN-04 | Resource cards restyled as monochrome terminal listings (no rainbow badge colors) | Section: Badge Restyle |
| DSGN-05 | Search bar, filters, and detail page restyled with terminal aesthetic | Section: Component Restyling |
| DSGN-06 | Loading skeletons with terminal character replace text-only loading states | Section: Loading Skeletons |
| DSGN-07 | Cmd+K keyboard shortcut focuses search input | Section: Keyboard Shortcut |
| STAB-02 | Error boundaries (error.tsx) exist at app/ and app/resources/[slug]/ with terminal-styled fallback | Section: Error Boundaries |
| STAB-04 | AI classification JSON from Claude is validated against expected schema before database insert | Section: Schema Validation |
| QUAL-01 | Label maps (typeLabels, pillarLabels, typeColors) extracted to shared lib/constants.ts | Section: Constants Extraction |
</phase_requirements>

---

## Standard Stack

### Core (already installed — no new installs needed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next/font/google | bundled with Next.js 16.1.6 | Geist Mono font loading | Zero-runtime, self-hosted, subset-optimized |
| tailwindcss | 3.4.19 | Utility classes + dark mode via `.dark` class | Already the project's CSS engine |
| class-variance-authority | 0.7.1 | Badge/Button variant definitions | Already used in `badge.tsx`, `button.tsx` |
| lucide-react | 0.511.0 | Search icon for Cmd+K indicator | Already installed; use `Search` icon |

### No New Dependencies Required
All phase work is achievable with the existing stack. Specifically:
- No `next-themes` — forced dark mode is a static HTML class attribute
- No `zod` — STAB-04 validator is plain TypeScript
- No animation libraries — terminal skeletons use CSS `animate-pulse` from `tailwindcss-animate` (already installed)
- No keyboard shortcut library — native `useEffect` + `window.addEventListener('keydown')` in a Client Component

**Installation:** None required.

---

## Architecture Patterns

### Recommended File Changes Map
```
app/
├── layout.tsx              # Add dark class + swap to Geist_Mono
├── globals.css             # Rewrite :root and .dark CSS variables
├── error.tsx               # NEW — app-level error boundary
└── resources/
    └── [slug]/
        ├── page.tsx        # Import typeLabels/pillarLabels from constants
        └── error.tsx       # NEW — route-level error boundary

components/
├── resource-card.tsx       # Import from constants; restyle badges + tags
├── search-bar.tsx          # Add Cmd+K listener + ref forwarding
├── filters.tsx             # Import from constants; restyle active filter badges
├── resource-skeleton.tsx   # NEW — terminal loading skeleton
└── ui/
    ├── badge.tsx           # Remove rounded-md, use rounded-none
    ├── card.tsx            # Remove rounded-xl, use rounded-none
    ├── button.tsx          # Remove rounded-md, use rounded-none
    └── input.tsx           # Remove rounded-md, use rounded-none

lib/
├── constants.ts            # NEW — typeLabels, pillarLabels, typeColors, TYPES, PILLARS, LEVELS
└── validators.ts           # NEW — ResourceClassification schema + validate function

tailwind.config.ts          # Add fontFamily.mono override for Geist Mono
```

### Pattern 1: Forced Dark Mode (DSGN-03)

**What:** Add `className="dark"` to `<html>` in `layout.tsx`. Tailwind's `darkMode: ["class"]` activates `.dark` CSS variables the moment the class is present.
**When to use:** Any time dark mode must be the only mode — no toggle, no system preference, no localStorage state.

```tsx
// app/layout.tsx — confirmed pattern for Tailwind darkMode: ["class"]
<html lang="en" className="dark">
  <body className={`${geistMono.className} antialiased`}>
    {children}
  </body>
</html>
```

**Critical:** Do not use `suppressHydrationWarning` — that is only needed when the class toggles client-side. A static `"dark"` class never causes hydration mismatch.

### Pattern 2: CSS Variable Rewrite for Terminal Palette (DSGN-01)

**What:** Replace both `:root` and `.dark` blocks in `globals.css` with a single terminal palette. Because dark mode is forced, `:root` can contain the dark values directly — the `.dark` block becomes redundant but keeping it identical to `:root` is safest.

Terminal palette target values (HSL format, matching Tailwind's expected format):
```css
/* app/globals.css — terminal palette */
@layer base {
  :root {
    --background: 0 0% 0%;          /* #000000 pure black */
    --foreground: 0 0% 98%;         /* #fafafa near-white */
    --card: 0 0% 4%;                /* #0a0a0a very dark */
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 4%;
    --popover-foreground: 0 0% 98%;
    --primary: 180 100% 50%;        /* #00ffff pure cyan */
    --primary-foreground: 0 0% 0%;  /* black text on cyan */
    --secondary: 0 0% 10%;          /* dark gray */
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 10%;
    --muted-foreground: 0 0% 60%;   /* medium gray */
    --accent: 0 0% 15%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 84% 60%;       /* red — only for errors */
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 20%;             /* subtle dark border */
    --input: 0 0% 15%;
    --ring: 180 100% 50%;           /* cyan focus ring */
    --radius: 0rem;                 /* zero — sharp corners everywhere */
  }
  .dark {                           /* identical to :root — dark is the only mode */
    /* ... same values ... */
  }
}
```

**Key insight on cyan:** `180 100% 50%` in HSL = `hsl(180, 100%, 50%)` = `#00ffff`. This is pure terminal cyan. Use as `--primary` so Tailwind's `bg-primary`, `text-primary`, `ring-primary` all resolve to cyan automatically.

### Pattern 3: Font Switch — Geist Mono (DSGN-02)

**What:** Replace `Geist` (sans) with `Geist_Mono` from `next/font/google` in `layout.tsx`. Register the CSS variable `--font-geist-mono`. Override Tailwind's `fontFamily.sans` with the mono font so all `font-sans` classes (used throughout shadcn) resolve to monospace.

```tsx
// app/layout.tsx
import { Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  display: "swap",
  subsets: ["latin"],
});
```

```ts
// tailwind.config.ts — extend fontFamily
theme: {
  extend: {
    fontFamily: {
      sans: ["var(--font-geist-mono)", "monospace"],
      mono: ["var(--font-geist-mono)", "monospace"],
    },
    // ... existing colors, borderRadius ...
  },
},
```

**Why override `sans`:** shadcn components use `font-sans` by default. Overriding `sans` to Geist Mono means zero per-component changes are needed for font propagation.

### Pattern 4: Removing Hardcoded Rounded Classes (DSGN-01 support)

**What:** When `--radius: 0rem`, Tailwind's `rounded-lg`, `rounded-md`, `rounded-sm` all compute to `0rem`. BUT the shadcn components use literal `rounded-xl` (card.tsx) and `rounded-full` (resource-card.tsx tags) which bypass the CSS variable entirely.

**Files with hardcoded rounded that must change:**

| File | Current class | Change to |
|------|--------------|-----------|
| `components/ui/badge.tsx` | `rounded-md` in cva base | `rounded-none` |
| `components/ui/card.tsx` | `rounded-xl` on Card div | `rounded-none` |
| `components/ui/button.tsx` | `rounded-md` in cva base, `rounded-md` in `sm` and `lg` sizes | `rounded-none` |
| `components/ui/input.tsx` | `rounded-md` in className | `rounded-none` |
| `components/resource-card.tsx` | `rounded-full` on tag spans | `rounded-none` |

**Strategy:** Remove `rounded-*` entirely from cva base strings and size variants. The CSS variable handles `rounded-lg/md/sm`. Add explicit `rounded-none` only where `rounded-full` was used.

### Pattern 5: Constants Extraction (QUAL-01)

**What:** Create `lib/constants.ts` with all shared label/color maps. Three files currently duplicate these: `components/resource-card.tsx`, `app/resources/[slug]/page.tsx`, `components/filters.tsx`.

```ts
// lib/constants.ts
export const TYPE_LABELS: Record<string, string> = {
  tool: "Tool",
  course: "Course",
  // ...
};

export const PILLAR_LABELS: Record<string, string> = {
  discovery: "Discovery",
  // ...
};

// Terminal monochrome badge classes — replaces rainbow typeColors
export const TYPE_BADGE_CLASSES: Record<string, string> = {
  tool: "border-cyan-500 text-cyan-400",
  course: "border-foreground text-foreground",
  // all use border variants of the terminal palette
};

export const TYPES = [
  { value: "tool", label: "Tool" },
  // ...
];

export const PILLARS = [...];
export const LEVELS = [...];
```

**Import pattern in consumers:**
```ts
import { TYPE_LABELS, PILLAR_LABELS, TYPE_BADGE_CLASSES, TYPES, PILLARS, LEVELS } from "@/lib/constants";
```

### Pattern 6: Badge Monochrome Restyle (DSGN-04)

**What:** The `typeColors` map in `resource-card.tsx` uses 10 different color families (blue, purple, green, yellow, orange, pink, red, indigo, gray, teal). Replace with terminal-palette variants: primary/secondary/outline only, using cyan for the active type category.

Terminal badge approach: all type badges use `variant="outline"` with `border-border text-foreground` by default. The active/primary type uses `border-primary text-primary` (cyan). Featured badge: `border-primary text-primary`. Free badge: `text-foreground`, Paid badge: `text-muted-foreground`.

```tsx
// Monochrome badge — resource-card.tsx
<Badge variant="outline" className="border-border text-muted-foreground text-xs font-mono">
  {TYPE_LABELS[resource.type] || resource.type}
</Badge>
```

### Pattern 7: Error Boundaries (STAB-02)

**What:** Next.js App Router uses `error.tsx` files as React Error Boundaries. Must be Client Components (`"use client"`). Receive `error: Error` and `reset: () => void` as props.

```tsx
// app/error.tsx
"use client";
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-mono bg-background text-foreground p-8">
      <div className="border border-destructive p-6 max-w-lg w-full">
        <p className="text-destructive text-xs uppercase tracking-widest mb-4">// error</p>
        <p className="text-sm mb-6">{error.message || "An unexpected error occurred."}</p>
        <button onClick={reset} className="text-xs border border-border px-4 py-2 hover:border-primary hover:text-primary transition-colors">
          [ retry ]
        </button>
      </div>
    </div>
  );
}
```

**Two files needed:**
- `app/error.tsx` — catches errors in root layout children
- `app/resources/[slug]/error.tsx` — catches errors in the slug route

### Pattern 8: Loading Skeletons (DSGN-06)

**What:** Replace the text fallbacks in `Suspense` `fallback` props with terminal skeleton components. Use `animate-pulse` (from `tailwindcss-animate`, already installed) on block-level placeholder elements.

Terminal skeleton character: use `█` (U+2588 FULL BLOCK) or CSS `bg-muted` blocks to simulate text lines. This is more idiomatic than spinner animations for a terminal aesthetic.

```tsx
// components/resource-skeleton.tsx
export function ResourceCardSkeleton() {
  return (
    <div className="border border-border p-4 font-mono">
      <div className="h-3 w-16 bg-muted animate-pulse mb-3" />
      <div className="h-4 w-3/4 bg-muted animate-pulse mb-2" />
      <div className="h-3 w-full bg-muted animate-pulse mb-1" />
      <div className="h-3 w-5/6 bg-muted animate-pulse" />
    </div>
  );
}

export function ResourceGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <ResourceCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

Replace in `app/page.tsx`:
```tsx
<Suspense fallback={<ResourceGridSkeleton />}>
```

Replace in `app/resources/[slug]/page.tsx`:
```tsx
<Suspense fallback={<ResourceDetailSkeleton />}>
```

### Pattern 9: Cmd+K Keyboard Shortcut (DSGN-07)

**What:** Add a `useEffect` listener in `search-bar.tsx` (already a `"use client"` component). When `metaKey + k` (Mac) or `ctrlKey + k` (Windows) is detected, call `focus()` on the input ref.

```tsx
// components/search-bar.tsx
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, []);
```

**Wiring:** Pass `inputRef` to the `<Input>` component. The shadcn `Input` uses `React.forwardRef`, so `ref={inputRef}` works directly.

**Cmd+K hint text:** Update `placeholder` to `"Search resources... (⌘K)"` so users discover the shortcut.

### Pattern 10: Schema Validation — lib/validators.ts (STAB-04)

**What:** The sync edge function (Phase 4) will call Claude to classify a Raindrop bookmark, get back JSON, and must validate it before inserting to Supabase. No edge function exists yet, so this is preparation only: create `lib/validators.ts` with a schema definition and typed validation function.

**No zod required.** Plain TypeScript type guard + explicit field checks:

```ts
// lib/validators.ts
export type ResourceClassification = {
  name: string;
  description: string;
  type: ResourceType;
  pillar: ResourcePillar;
  level: ResourceLevel;
  tags: string[];
  expert_take: string;
  is_free: boolean;
  language: string;
};

export type ResourceType = "tool" | "course" | "article" | "newsletter" | "book" | "podcast" | "video" | "community" | "x_post" | "framework";
export type ResourcePillar = "discovery" | "design" | "delivery" | "strategy" | "stack" | "meta_skill";
export type ResourceLevel = "beginner" | "intermediate" | "advanced";

const VALID_TYPES: ResourceType[] = ["tool", "course", "article", "newsletter", "book", "podcast", "video", "community", "x_post", "framework"];
const VALID_PILLARS: ResourcePillar[] = ["discovery", "design", "delivery", "strategy", "stack", "meta_skill"];
const VALID_LEVELS: ResourceLevel[] = ["beginner", "intermediate", "advanced"];

export class ValidationError extends Error {
  constructor(public field: string, public reason: string) {
    super(`Validation failed for field "${field}": ${reason}`);
    this.name = "ValidationError";
  }
}

export function validateResourceClassification(raw: unknown): ResourceClassification {
  if (typeof raw !== "object" || raw === null) {
    throw new ValidationError("root", "Expected an object");
  }
  const obj = raw as Record<string, unknown>;
  if (typeof obj.name !== "string" || !obj.name.trim()) throw new ValidationError("name", "Required non-empty string");
  if (typeof obj.description !== "string") throw new ValidationError("description", "Required string");
  if (!VALID_TYPES.includes(obj.type as ResourceType)) throw new ValidationError("type", `Must be one of: ${VALID_TYPES.join(", ")}`);
  if (!VALID_PILLARS.includes(obj.pillar as ResourcePillar)) throw new ValidationError("pillar", `Must be one of: ${VALID_PILLARS.join(", ")}`);
  if (!VALID_LEVELS.includes(obj.level as ResourceLevel)) throw new ValidationError("level", `Must be one of: ${VALID_LEVELS.join(", ")}`);
  if (!Array.isArray(obj.tags) || !obj.tags.every((t) => typeof t === "string")) throw new ValidationError("tags", "Must be string[]");
  if (typeof obj.expert_take !== "string") throw new ValidationError("expert_take", "Required string");
  if (typeof obj.is_free !== "boolean") throw new ValidationError("is_free", "Required boolean");
  if (typeof obj.language !== "string" || !obj.language.trim()) throw new ValidationError("language", "Required non-empty string");
  return obj as unknown as ResourceClassification;
}
```

**Why not import from constants.ts:** `lib/validators.ts` must work in the Supabase edge function (Deno environment) as well as the Next.js app. Keep it self-contained with its own type definitions to avoid bundling issues. The Deno ESM import problem was already encountered in Phase 1 (`tsconfig` fix). Keep validators.ts dependency-free.

### Anti-Patterns to Avoid

- **Do not use `next-themes`** for forced dark mode. It requires a Provider, flicker prevention, and localStorage sync — all unnecessary when dark is the only mode.
- **Do not put the `dark` class only on `<body>`** — Tailwind's `.dark` selector must be on `<html>` for the cascade to work correctly in all contexts.
- **Do not import `lib/constants.ts` from `lib/validators.ts`** — validators must remain edge-function compatible (no Next.js-specific imports).
- **Do not use `rounded-[0px]` arbitrary values** — `rounded-none` is the idiomatic Tailwind class and is already in the generated set.
- **Do not use CSS `color-scheme: dark`** — this affects browser chrome (scrollbars, form controls). It is fine to add as a polish step but is not required for the palette to work.
- **Do not modify `tailwind.config.ts` borderRadius extension to remove `lg/md/sm`** — shadcn components reference `var(--radius)` via these entries. Keep them, just set `--radius: 0rem` and they compute to zero.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Monospace font loading | Custom `@font-face` | `next/font/google` with `Geist_Mono` | Automatic subset optimization, no layout shift, self-hosted on Vercel |
| Skeleton animation | Custom CSS keyframes | `animate-pulse` from `tailwindcss-animate` | Already installed; tested, cross-browser |
| Error boundary class component | Custom React class component | Next.js `error.tsx` convention | App Router handles mount/unmount, server error digest, retry button |
| Keyboard shortcut manager | Custom hook abstraction | Direct `useEffect` + `addEventListener` in search-bar.tsx | One shortcut, one component — abstraction is premature |
| Type validation | Zod or other library | Plain TypeScript type guard in `lib/validators.ts` | No new dependency, edge-function safe, sufficient for a fixed schema |

---

## Common Pitfalls

### Pitfall 1: Dark Class on Body Instead of HTML
**What goes wrong:** Dark mode CSS variables don't activate for elements that inherit from `:root` rather than `.dark` on `html`.
**Why it happens:** Developers put the class on `<body>` thinking it's equivalent.
**How to avoid:** Always add `className="dark"` to the `<html>` element in `app/layout.tsx`.
**Warning signs:** Colors look correct in dev tools when inspecting `body` but are wrong for `html`-level `background-color`.

### Pitfall 2: HSL Format Mismatch in CSS Variables
**What goes wrong:** Tailwind CSS variable colors are defined as `hsl(180, 100%, 50%)` but the CSS variable must store ONLY the channel values `180 100% 50%` (no `hsl()` wrapper) because the config wraps them: `hsl(var(--primary))`.
**Why it happens:** Confusing the CSS variable value format with the final CSS value format.
**How to avoid:** In `globals.css`, write `--primary: 180 100% 50%;` not `--primary: hsl(180, 100%, 50%);`.
**Warning signs:** Tailwind color utilities produce `hsl(hsl(180, 100%, 50%))` in computed styles — visually the color may fall back to transparent or black.

### Pitfall 3: Font Variable Not Applied to Body
**What goes wrong:** Geist Mono is loaded with `next/font/google` and a CSS variable is registered, but if only `geistMono.variable` (the CSS variable class) is applied to `<body>` — and NOT `geistMono.className` — the font won't apply to text, just define the variable.
**Why it happens:** The two font class properties (`variable` vs `className`) have different purposes. `variable` exposes the CSS custom property; `className` directly applies the font.
**How to avoid:** Apply `geistMono.className` to `<body>` (or `geistMono.variable` + override `font-sans` in Tailwind config to point at the variable). The Tailwind config override approach is recommended here because shadcn uses `font-sans`.
**Warning signs:** DevTools shows `--font-geist-mono` defined on `html` but `font-family` on `body` still shows `ui-sans-serif`.

### Pitfall 4: error.tsx Missing "use client" Directive
**What goes wrong:** Next.js error boundaries must be Client Components. Omitting `"use client"` causes a build error: "Error components must be Client Components."
**Why it happens:** Forgetting this is a React error boundary (class component pattern) wrapped by Next.js.
**How to avoid:** Always start `app/error.tsx` and `app/resources/[slug]/error.tsx` with `"use client";`.
**Warning signs:** Build fails with explicit error message.

### Pitfall 5: Cmd+K Listener Leaking Between Route Navigations
**What goes wrong:** If the `useEffect` cleanup isn't correct, multiple listeners stack up across soft navigations, causing `focus()` to fire multiple times.
**Why it happens:** Client-side navigation doesn't unmount/remount root components — but `SearchBar` is inside `Suspense`, so it does remount. Still, the cleanup return is required.
**How to avoid:** Always return the `removeEventListener` cleanup from `useEffect`.
**Warning signs:** The search input gets focused but also shows an extra console log or focus flicker.

### Pitfall 6: Constants Circular Import
**What goes wrong:** If `lib/constants.ts` imports from `lib/queries.ts` or `lib/utils.ts` that in turn import from `lib/constants.ts`, a circular dependency results.
**Why it happens:** Trying to co-locate type definitions with constants.
**How to avoid:** `lib/constants.ts` must have zero imports — it is pure data (arrays and plain objects). Types it needs can be redeclared inline or imported only from type-only modules.
**Warning signs:** Module resolution errors at build time or silent `undefined` exports.

---

## Code Examples

Verified patterns from the existing codebase and Next.js documentation:

### Dark Mode Forced — layout.tsx
```tsx
// app/layout.tsx
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistMono.variable} font-mono antialiased`}>
        {children}
      </body>
    </html>
  );
}
```
Note: Using `geistMono.variable` (not `.className`) + overriding `fontFamily.mono` in Tailwind config is the recommended pattern when you need `font-mono` utilities to resolve to Geist Mono throughout shadcn components.

### Tailwind Config Font Override
```ts
// tailwind.config.ts — additions only
theme: {
  extend: {
    fontFamily: {
      sans: ["var(--font-geist-mono)", "Courier New", "monospace"],
      mono: ["var(--font-geist-mono)", "Courier New", "monospace"],
    },
    // ... existing borderRadius, colors ...
  },
},
```

### Next.js App Router error.tsx Pattern
```tsx
// app/error.tsx
"use client";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    // terminal-styled UI here
  );
}
```

### Cmd+K in SearchBar
```tsx
// Requires "use client" — already present in search-bar.tsx
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  const down = (e: KeyboardEvent) => {
    if ((e.key === "k" && (e.metaKey || e.ctrlKey))) {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };
  document.addEventListener("keydown", down);
  return () => document.removeEventListener("keydown", down);
}, []);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `Geist` (sans) import | `Geist_Mono` import | Phase 2 | Full monospace typography globally |
| `:root` light mode active | `:root` = dark terminal palette | Phase 2 | No theme toggle, one consistent UI |
| Rainbow `typeColors` map | Monochrome outline badge classes | Phase 2 | On-palette, no blue/purple/green leakage |
| Text fallback in Suspense | `ResourceGridSkeleton` component | Phase 2 | Terminal-consistent loading state |
| No error.tsx | Two error boundary files | Phase 2 | Graceful error display instead of crash screen |
| Duplicated label maps × 3 files | Single `lib/constants.ts` | Phase 2 | One-place updates, no drift |

**Deprecated/outdated in this codebase:**
- `typeColors` in `resource-card.tsx`: replace with `TYPE_BADGE_CLASSES` from constants
- `typeLabels`/`pillarLabels` duplicated in `resource-card.tsx` and `[slug]/page.tsx`: both replaced by constants import
- `TYPES`/`PILLARS`/`LEVELS` in `filters.tsx`: replaced by constants import
- `--font-geist-sans` CSS variable and `Geist` font import in `layout.tsx`: replaced by `--font-geist-mono` / `Geist_Mono`
- `hasEnvVars` export in `lib/utils.ts`: leftover tutorial code, can be deleted in this phase or next

---

## Open Questions

1. **Terminal palette: pure black (#000) vs near-black (#0a0a0a) for card backgrounds**
   - What we know: `--background: 0 0% 0%` = pure black; `--card` could be slightly lighter to create depth
   - What's unclear: Whether cards need visual separation from the page background
   - Recommendation: Set `--card: 0 0% 4%` (very dark, nearly invisible separation) — gives depth without color

2. **Cyan: pure cyan (#00ffff) vs a slightly dimmer terminal cyan (#00e5e5)**
   - What we know: Pure cyan at 100% lightness can be visually harsh on pure black backgrounds
   - What's unclear: Whether the client prefers saturated or slightly muted terminal look
   - Recommendation: Use `--primary: 180 100% 50%` (pure #00ffff) for authenticity; can be tuned in Phase 2 execution

3. **STAB-04 placement: lib/validators.ts in Next.js app vs supabase/functions/**
   - What we know: The validator logic will be called from a Supabase edge function in Phase 4; Phase 4 creates the function in `supabase/functions/`; Phase 1 excluded `supabase/functions/` from Next.js TypeScript compilation
   - What's unclear: Whether the validator should live in `lib/` (Next.js imports it for testing) or `supabase/functions/` (Deno imports it directly)
   - Recommendation: Create in `lib/validators.ts` for Phase 2. The edge function in Phase 4 will duplicate the type definitions inline (or import via a shared types file) to avoid Deno/Node import boundary issues.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no test runner installed |
| Config file | None — see Wave 0 gaps |
| Quick run command | `npm run build` (build-time type check acts as proxy) |
| Full suite command | `npm run build && npm run lint` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DSGN-01 | CSS variables use terminal palette; --radius: 0rem | manual-only | Verify `app/globals.css` diff + browser visual | ❌ Wave 0 |
| DSGN-02 | Geist Mono applied globally | manual-only | Load page, inspect font-family in DevTools | ❌ Wave 0 |
| DSGN-03 | dark class on html element | unit (type check) | `npm run build` | ❌ Wave 0 |
| DSGN-04 | No rainbow classes in resource-card.tsx | lint/grep | `grep -r "bg-blue\|bg-purple\|bg-green-100" components/` returns empty | ❌ Wave 0 |
| DSGN-05 | No off-palette colors in search-bar, filters, detail page | lint/grep | `grep -r "text-green-600\|text-orange-600" components/ app/` returns empty | ❌ Wave 0 |
| DSGN-06 | Skeleton components exist and render | build | `npm run build` | ❌ Wave 0 |
| DSGN-07 | Cmd+K focuses search input | manual-only | Browser test: Cmd+K on homepage | ❌ Wave 0 |
| STAB-02 | error.tsx files exist with terminal styling | build | `npm run build` confirms error boundary types | ❌ Wave 0 |
| STAB-04 | validateResourceClassification throws on bad input | unit | `tsc --noEmit` (type check) + manual test | ❌ Wave 0 |
| QUAL-01 | No duplicate label maps across files | lint/grep | `grep -r "const typeLabels" --include="*.ts" --include="*.tsx"` returns only constants.ts | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run build` (type-checks entire app)
- **Per wave merge:** `npm run build && npm run lint`
- **Phase gate:** Full build + lint green + manual browser visual check before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] No test runner installed — `npm run build` is the only automated gate available. This is acceptable given the March 17 deadline; visual correctness is the primary success criterion for this phase.
- [ ] Grep-based "no off-palette colors" check: run manually or as part of verifier. No Wave 0 setup required.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase read — `app/layout.tsx`, `app/globals.css`, `tailwind.config.ts`, all component files listed above
- Next.js App Router documentation (error.tsx, error handling) — https://nextjs.org/docs/app/building-your-application/routing/error-handling
- Next.js `next/font/google` documentation — https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Tailwind CSS dark mode documentation — https://tailwindcss.com/docs/dark-mode (darkMode: ["class"] pattern confirmed in `tailwind.config.ts`)

### Secondary (MEDIUM confidence)
- shadcn/ui theming documentation — https://ui.shadcn.com/docs/theming (CSS variable format confirmed against `globals.css` structure)
- Geist font availability confirmed in `next/font/google` package (both `Geist` and `Geist_Mono` are exported)

### Tertiary (LOW confidence — needs in-browser validation)
- Exact HSL values for terminal palette — derived from design intent, not from a design spec. Confirm visually during implementation.
- Cmd+K UX pattern — derived from common productivity tool conventions (Linear, Vercel dashboard). No official Next.js guidance exists.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed, confirmed in `package.json`
- Architecture: HIGH — file list derived from direct codebase reading, not inference
- CSS variable patterns: HIGH — confirmed against existing `globals.css` structure and Tailwind docs
- Terminal palette values: MEDIUM — HSL values are technically correct but aesthetically unverified until rendered
- Pitfalls: HIGH — derived from actual code patterns observed in the codebase

**Research date:** 2026-03-13
**Valid until:** 2026-03-20 (7 days — Next.js and Tailwind are stable here; no fast-moving dependencies)
