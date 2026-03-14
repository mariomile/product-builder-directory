# Architecture Patterns

**Domain:** Terminal-style design system integration for Next.js + shadcn/ui directory app
**Researched:** 2026-03-12
**Confidence:** HIGH (all recommendations based on existing codebase analysis + established shadcn/ui patterns)

## Recommended Architecture

### Strategy: CSS Variable Override + In-Place Component Modification

The terminal design overhaul should be implemented as a **theme-level transformation**, not a component rewrite. The existing shadcn/ui setup already uses CSS custom properties as a single source of truth for all visual tokens. The correct approach is:

1. Redefine CSS variables in `globals.css` to the terminal palette
2. Modify shadcn/ui primitives in-place (they are owned project files, not dependencies)
3. Restyle feature components to remove non-terminal visual patterns
4. Extract shared constants to eliminate duplication

This avoids creating wrapper components, parallel themes, or any new abstraction layers. The existing architecture is well-suited for this transformation.

### Component Boundaries

| Component | Layer | Responsibility | Communicates With | Modification Scope |
|-----------|-------|---------------|-------------------|--------------------|
| `globals.css` | Theme | CSS variable definitions, global resets | All components via variables | HEAVY -- redefine entire palette |
| `tailwind.config.ts` | Theme | Maps CSS vars to Tailwind classes, border-radius | All Tailwind usage | LIGHT -- set radius to 0, add cyan |
| `app/layout.tsx` | Layout | Font loading, ThemeProvider | All pages | MEDIUM -- swap Geist to Geist Mono, force dark |
| `components/ui/card.tsx` | Primitive | Card container | ResourceCard, detail page | LIGHT -- remove rounded-xl |
| `components/ui/badge.tsx` | Primitive | Label badges | ResourceCard, Filters, detail page | LIGHT -- remove rounded-md |
| `components/ui/button.tsx` | Primitive | Clickable actions | Detail page CTA, filters clear | LIGHT -- remove rounded-md |
| `components/ui/input.tsx` | Primitive | Text input | SearchBar | MEDIUM -- terminal prompt styling |
| `components/resource-card.tsx` | Feature | Resource display card | ResourceGrid, UI primitives | HEAVY -- replace rainbow colors with monochrome |
| `components/search-bar.tsx` | Feature | Search with URL push | Input primitive, router | MEDIUM -- terminal prompt prefix |
| `components/filters.tsx` | Feature | Filter badge groups | Badge primitive, router | MEDIUM -- terminal-style grouping |
| `components/resource-grid.tsx` | Feature | Grid layout + data fetch | ResourceCard, queries | LIGHT -- section header styling |
| `lib/constants.ts` | Data | Shared label maps, type config | All feature components | NEW -- extract from 3 duplicated files |
| `app/page.tsx` | Page | Homepage layout | All feature components | MEDIUM -- terminal nav, hero, footer |
| `app/resources/[slug]/page.tsx` | Page | Detail layout | Primitives, ResourceCard | MEDIUM -- terminal detail styling |

### Data Flow

Data flow does not change. The design overhaul is purely presentational. The existing flow remains:

```
URL params --> Server Component --> Supabase query --> Resource[] --> ResourceCard render
                                                                        |
                                                            CSS Variables (globals.css)
                                                                        |
                                                            shadcn/ui primitives
                                                                        |
                                                            Tailwind utility classes
```

**Theme token flow (what changes):**

```
globals.css (CSS variables)
    |
    +--> tailwind.config.ts (maps vars to classes)
    |       |
    |       +--> components/ui/*.tsx (consume via Tailwind classes)
    |       |       |
    |       |       +--> components/*.tsx (feature components use primitives)
    |       |               |
    |       |               +--> app/*.tsx (pages compose feature components)
    |       |
    |       +--> Direct Tailwind usage in any .tsx file
    |
    +--> Direct CSS var usage (e.g., hsl(var(--accent)))
```

Key insight: because the existing codebase already uses `bg-primary`, `text-foreground`, `border-border` etc. (Tailwind classes mapped to CSS variables), changing the variable values in `globals.css` automatically propagates to every component. The only components that bypass this system are those with hardcoded Tailwind colors (like `bg-blue-100` in resource-card.tsx) -- those must be manually updated.

## Patterns to Follow

### Pattern 1: CSS Variable Terminal Palette

**What:** Redefine all HSL CSS variables to a strict black/white/cyan palette.
**When:** First step -- everything else depends on this.
**Why:** Single change point. All shadcn components and Tailwind classes already reference these variables.

```css
/* globals.css -- Terminal palette */
:root {
  /* Force dark-only. No light theme. Terminal = dark. */
  --background: 0 0% 0%;           /* Pure black */
  --foreground: 0 0% 100%;         /* Pure white */
  --card: 0 0% 4%;                 /* Near-black card bg */
  --card-foreground: 0 0% 100%;    /* White text on cards */
  --popover: 0 0% 4%;
  --popover-foreground: 0 0% 100%;
  --primary: 187 100% 50%;         /* Cyan -- the accent */
  --primary-foreground: 0 0% 0%;   /* Black text on cyan */
  --secondary: 0 0% 10%;           /* Dark gray for secondary */
  --secondary-foreground: 0 0% 80%;
  --muted: 0 0% 10%;               /* Dark gray for muted areas */
  --muted-foreground: 0 0% 55%;    /* Mid-gray for muted text */
  --accent: 187 100% 50%;          /* Cyan again */
  --accent-foreground: 0 0% 0%;
  --destructive: 0 70% 50%;        /* Keep red for errors */
  --destructive-foreground: 0 0% 100%;
  --border: 0 0% 20%;              /* Subtle dark border */
  --input: 0 0% 15%;               /* Input background */
  --ring: 187 100% 50%;            /* Cyan focus ring */
  --radius: 0rem;                  /* Sharp corners everywhere */
}
```

Remove the `.dark` class override entirely. The terminal aesthetic IS the dark theme. Set `next-themes` to `defaultTheme="dark"` and `forcedTheme="dark"` to prevent theme switching. Remove the `ThemeSwitcher` component from the nav.

### Pattern 2: Font Swap to Geist Mono

**What:** Replace `Geist` (sans) with `Geist_Mono` (monospace) in root layout.
**When:** Same time as CSS variable changes.
**Why:** Geist Mono is already bundled with Next.js (via `next/font/google`). Terminal aesthetic requires monospace everywhere.

```typescript
// app/layout.tsx
import { Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  display: "swap",
  subsets: ["latin"],
});

// In the body:
<body className={`${geistMono.className} antialiased`}>
```

### Pattern 3: Monochrome Badge System

**What:** Replace the rainbow per-type color badges with a monochrome terminal style.
**When:** After CSS variables and shared constants are in place.
**Why:** The current `typeColors` map uses 10 different colors (blue, purple, green, yellow, etc.) which violates the black/white/cyan constraint. Terminal UIs differentiate with prefixes, borders, and weight -- not color.

```typescript
// lib/constants.ts -- single source of truth
export const RESOURCE_TYPES = [
  { value: "tool", label: "Tool", prefix: ">" },
  { value: "course", label: "Course", prefix: "#" },
  { value: "article", label: "Article", prefix: "$" },
  // ...
] as const;

export const typeLabels = Object.fromEntries(
  RESOURCE_TYPES.map(t => [t.value, t.label])
);

export const pillarLabels: Record<string, string> = {
  discovery: "Discovery",
  design: "Design",
  delivery: "Delivery",
  strategy: "Strategy",
  stack: "Stack & Tools",
  meta_skill: "Meta-skill",
};
```

Badges become: outlined with white text on dark background. Active/selected badges use cyan border/text. No per-type color differentiation -- the label text is sufficient.

### Pattern 4: Terminal Search Prompt

**What:** Style the search input as a terminal command line.
**When:** After input primitive is updated.
**Why:** Reinforces the terminal metaphor. Search = typing a command.

```typescript
// SearchBar component approach
<div className="flex items-center border border-border bg-card">
  <span className="px-3 text-accent font-mono select-none">$</span>
  <Input
    type="search"
    placeholder="search resources..."
    className="border-0 bg-transparent focus-visible:ring-0"
  />
</div>
```

### Pattern 5: In-Place shadcn Primitive Modification

**What:** Edit the owned shadcn/ui files directly to remove rounded corners and adjust defaults.
**When:** After CSS variables are set (radius=0 handles most, but hardcoded `rounded-*` classes must be removed).
**Why:** shadcn components are project-owned files. The `--radius: 0rem` variable handles the `borderRadius` Tailwind config, but some components have hardcoded `rounded-xl`, `rounded-md`, `rounded-full` classes that bypass the variable.

Files needing hardcoded round removal:
- `card.tsx`: `rounded-xl` -- remove (will use `--radius` via Tailwind config)
- `badge.tsx`: `rounded-md` -- remove
- `button.tsx`: `rounded-md` -- remove (in base and size variants)
- `input.tsx`: `rounded-md` -- remove
- `resource-card.tsx`: `rounded-full` on tag spans -- remove

## Anti-Patterns to Avoid

### Anti-Pattern 1: Creating Wrapper Components

**What:** Wrapping shadcn/ui components in terminal-styled wrappers (e.g., `TerminalCard` around `Card`).
**Why bad:** Adds unnecessary abstraction. shadcn components are owned files -- edit them directly. Wrappers create confusion about which component to use. With a 5-day deadline, simplicity wins.
**Instead:** Modify `components/ui/card.tsx` directly. It is your file.

### Anti-Pattern 2: Parallel Theme System

**What:** Creating a separate `terminal-theme.css` alongside the existing `globals.css` themes.
**Why bad:** The app already has a working CSS variable system. A parallel system creates conflicts, specificity wars, and maintenance burden. The terminal aesthetic is not a "theme option" -- it IS the design.
**Instead:** Replace the existing `:root` and `.dark` definitions with a single terminal palette. Remove the theme switcher.

### Anti-Pattern 3: Using Arbitrary Tailwind Values for Cyan

**What:** Sprinkling `text-[#00ffff]` or `border-[hsl(187,100%,50%)]` throughout components.
**Why bad:** Bypasses the design system. Hard to change later. Inconsistent shades.
**Instead:** Map cyan to the existing `--accent` and `--primary` CSS variables. Use `text-accent`, `border-primary`, etc.

### Anti-Pattern 4: Gradual Migration (Component-by-Component)

**What:** Updating one component at a time to terminal style while others remain in the old style.
**Why bad:** Creates visual inconsistency during the transition. With CSS variables, the entire app can flip at once.
**Instead:** Change CSS variables first (instant global effect), then refine individual components. The app looks "mostly terminal" immediately after variable swap.

### Anti-Pattern 5: Keeping Light Mode

**What:** Maintaining both light and dark terminal themes.
**Why bad:** Terminal aesthetic is inherently dark. A "light terminal" looks wrong and requires double the design work. The project spec says "black and white only" -- that means dark background, light text.
**Instead:** Force dark theme. Remove `ThemeSwitcher`. Set `forcedTheme="dark"` on ThemeProvider.

## Suggested Build Order (Dependencies)

Build order matters because of cascading dependencies:

```
Phase 1: Foundation (no dependencies)
  |
  +--> 1a. CSS variables in globals.css (terminal palette, radius: 0)
  +--> 1b. Font swap in layout.tsx (Geist --> Geist Mono)
  +--> 1c. Force dark theme, remove ThemeSwitcher
  +--> 1d. Extract shared constants to lib/constants.ts (dedup label maps)
  |
  v
Phase 2: Primitives (depends on Phase 1)
  |
  +--> 2a. card.tsx: remove rounded-xl, adjust shadow
  +--> 2b. badge.tsx: remove rounded-md, terminal badge style
  +--> 2c. button.tsx: remove rounded-md
  +--> 2d. input.tsx: remove rounded-md, terminal input style
  |
  v
Phase 3: Feature Components (depends on Phase 1 + 2)
  |
  +--> 3a. resource-card.tsx: monochrome badges, remove rainbow colors, import from constants
  +--> 3b. search-bar.tsx: terminal prompt prefix ($)
  +--> 3c. filters.tsx: terminal filter style, import from constants
  |
  v
Phase 4: Page Layouts (depends on Phase 1-3)
  |
  +--> 4a. page.tsx: terminal nav, hero text, footer
  +--> 4b. resources/[slug]/page.tsx: terminal detail layout, import from constants
  +--> 4c. Loading skeletons + error boundaries (terminal styled)
```

**Phase 1 is the highest-leverage step.** After completing it, the entire app already looks ~70% terminal due to CSS variable propagation. Phases 2-4 refine the remaining details.

**Parallelizable work:**
- 1a, 1b, 1c can be done in a single commit (all in different files)
- 1d is independent of 1a-1c
- All items within Phase 2 are independent of each other
- 3a, 3b, 3c are independent of each other
- 4a, 4b are independent; 4c depends on knowing the final visual style

## Hardcoded Color Inventory

These locations bypass CSS variables and must be manually updated during the design overhaul:

| File | Hardcoded Colors | Action |
|------|-----------------|--------|
| `components/resource-card.tsx` | `bg-blue-100`, `bg-purple-100`, `bg-green-100`, `bg-yellow-100`, `bg-orange-100`, `bg-pink-100`, `bg-red-100`, `bg-indigo-100`, `bg-gray-100`, `bg-teal-100` (and dark variants) | Replace entire `typeColors` map with monochrome styles |
| `components/resource-card.tsx` | `bg-amber-100 text-amber-800` (Featured badge) | Replace with `bg-accent text-accent-foreground` or `border-accent text-accent` |
| `components/resource-card.tsx` | `text-green-600` (Free), `text-orange-600` (Paid) | Replace with `text-accent` / `text-muted-foreground` |
| `components/resource-card.tsx` | `rounded-full` on tag spans | Remove |
| `app/resources/[slug]/page.tsx` | `bg-amber-100 text-amber-800` (Featured badge) | Replace with accent color |
| `app/resources/[slug]/page.tsx` | `text-green-600 border-green-300` (Free), `text-orange-600 border-orange-300` (Paid) | Replace with accent / muted |

## Key Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Hardcoded Tailwind colors missed during migration | Medium | Low (visual inconsistency) | Search codebase for `bg-blue`, `bg-purple`, `text-green`, `bg-amber`, etc. |
| `rounded-*` classes missed | Low | Low (visual inconsistency) | Search for `rounded-` in all .tsx files |
| Geist Mono readability at small sizes | Low | Medium (UX impact) | Test at `text-xs` and `text-sm` -- may need slight size bumps |
| Forced dark theme breaks any light-mode-only styles | Low | Medium | Search for styles without `dark:` counterparts |

## Scalability Considerations

Not applicable for this design-focused milestone. The directory is a read-heavy public site with ~20-100 resources. The architecture handles this without scaling concerns.

The design system architecture itself scales well because:
- CSS variables are O(1) -- adding 1000 components does not increase theme complexity
- shadcn/ui components are individually owned -- no upstream dependency conflicts
- Monochrome palette is inherently consistent -- fewer visual states to manage

## Sources

- Codebase analysis: `globals.css`, `tailwind.config.ts`, `components.json`, all component files (HIGH confidence)
- shadcn/ui architecture: components are project-owned files using CSS variables + CVA + Tailwind (HIGH confidence -- verified in codebase)
- Next.js font loading: `next/font/google` supports `Geist_Mono` (HIGH confidence -- `Geist` already used in layout.tsx)
- CSS custom properties cascade: standard CSS specification (HIGH confidence)

---

*Architecture research: 2026-03-12*
