# Technology Stack: Terminal Design System

**Project:** Product Builder Directory
**Researched:** 2026-03-12
**Focus:** Terminal-style design overhaul for Next.js + Tailwind CSS 3 + shadcn/ui

## Recommended Stack

### Core Design Tokens (CSS Variables)

No new packages needed. The entire terminal aesthetic is achieved through CSS variable changes, Tailwind config, and shadcn/ui component modifications.

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | ^3.4.1 (already installed) | Utility-first styling | Already in place; configure theme for terminal palette |
| shadcn/ui | new-york style (already configured) | Component primitives | Modify CSS variables + component classes for terminal look |
| Geist Mono | via `next/font/google` | Monospace typography | Bundled with Next.js ecosystem, designed for terminals/code; no extra package |
| class-variance-authority | ^0.7.1 (already installed) | Component variants | Already in place for shadcn; use for terminal-specific variants |

### Typography

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Geist Mono (`Geist_Mono`) | Latest via next/font/google | ALL text across the entire app | Project requirement: monospace everywhere. Geist Mono is designed for terminals and code interfaces. HIGH readability for a monospace font. |

**Current state:** Layout imports `Geist` (sans) only. Must add `Geist_Mono` import.

**Implementation:**
```typescript
// app/layout.tsx - replace Geist sans with Geist Mono
import { Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  display: "swap",
  subsets: ["latin"],
});

// In body: className={`${geistMono.className} antialiased`}
```

**Tailwind config addition:**
```typescript
// tailwind.config.ts - extend fontFamily
fontFamily: {
  mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
},
```

**Confidence:** HIGH -- Geist_Mono is available via `next/font/google` (verified on Google Fonts). The `Geist` import already works in the current layout, so `Geist_Mono` uses the identical pattern.

### Color Palette

The palette is black, white, and cyan ONLY. No other hue allowed.

| Token | Light Mode (HSL) | Dark Mode (HSL) | Purpose |
|-------|-------------------|------------------|---------|
| `--background` | `0 0% 100%` (white) | `0 0% 2%` (near-black) | Page background |
| `--foreground` | `0 0% 4%` (near-black) | `0 0% 98%` (near-white) | Primary text |
| `--card` | `0 0% 100%` (white) | `0 0% 4%` (near-black) | Card surfaces |
| `--card-foreground` | `0 0% 4%` | `0 0% 98%` | Card text |
| `--primary` | `180 100% 30%` (dark cyan) | `180 100% 50%` (bright cyan) | Primary actions, links, accent |
| `--primary-foreground` | `0 0% 100%` (white) | `0 0% 2%` (black) | Text on primary |
| `--secondary` | `0 0% 96%` (light gray) | `0 0% 10%` (dark gray) | Secondary surfaces |
| `--secondary-foreground` | `0 0% 4%` | `0 0% 98%` | Secondary text |
| `--muted` | `0 0% 94%` (light gray) | `0 0% 12%` (dark gray) | Muted backgrounds |
| `--muted-foreground` | `0 0% 40%` (medium gray) | `0 0% 60%` (medium gray) | Subdued text |
| `--accent` | `180 100% 30%` (cyan) | `180 100% 50%` (cyan) | Same as primary -- cyan IS the accent |
| `--accent-foreground` | `0 0% 100%` | `0 0% 2%` | Text on accent |
| `--border` | `0 0% 85%` (gray) | `0 0% 18%` (dark gray) | All borders |
| `--input` | `0 0% 85%` | `0 0% 18%` | Input borders |
| `--ring` | `180 100% 30%` (cyan) | `180 100% 50%` (cyan) | Focus rings -- cyan |
| `--destructive` | `0 0% 40%` (gray) | `0 0% 60%` (gray) | Errors -- grayscale, no red |
| `--radius` | `0rem` | `0rem` | ZERO radius everywhere |

**Key decisions:**
- `--radius: 0rem` eliminates ALL rounded corners globally. Every shadcn/ui component that uses `rounded-lg`, `rounded-md`, `rounded-sm` will resolve to `0` because they all reference `var(--radius)`. This is the single most impactful change for the terminal aesthetic.
- Cyan at `hsl(180, 100%, 30%)` for light mode and `hsl(180, 100%, 50%)` for dark mode. The light mode value is darker to maintain contrast against white backgrounds.
- No red for destructive -- use gray. The constraint is "black, white, cyan only." Red violations break the aesthetic.
- Remove ALL chart variables -- not needed for a directory app.

**Confidence:** HIGH -- The `--radius: 0rem` trick is the official shadcn/ui mechanism (confirmed via shadcn theming docs and the Lyra style preset). HSL cyan values are standard color theory (180 hue = cyan).

### Infrastructure (No Changes)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | latest (16.x) | Framework | Already in place, no changes needed |
| Supabase | latest | Database + auth + edge functions | Already in place |
| Vercel | N/A | Deployment | Already targeted |
| PostCSS + autoprefixer | ^8 / ^10.4 | CSS processing | Already configured |
| tailwindcss-animate | ^1.0.7 | Animation utilities | Already installed; use for cursor blink, hover transitions |

## Terminal Design System: Implementation Guide

### Layer 1: CSS Variables (globals.css)

This is the foundation. Change the CSS variables in `globals.css` and the entire shadcn/ui component library transforms.

**What to change:**
1. Set `--radius: 0rem` (kills all rounded corners)
2. Replace all color values with the black/white/cyan palette above
3. Remove the dark mode toggle complexity -- force dark mode as default (terminal = dark)
4. Remove chart color variables (unused)

**Why force dark mode:** The terminal aesthetic is fundamentally dark. Light mode is secondary. Set `defaultTheme="dark"` in the ThemeProvider and design dark-first. Light mode can exist as a fallback but dark is the canonical presentation.

**Confidence:** HIGH

### Layer 2: Tailwind Config (tailwind.config.ts)

**Changes needed:**
```typescript
theme: {
  extend: {
    fontFamily: {
      mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      // Override sans too so font-sans also gives mono
      sans: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
    },
    colors: {
      // Keep the existing CSS variable references -- they already work
      // Add explicit cyan for direct use
      cyan: {
        DEFAULT: "hsl(180, 100%, 50%)",
        dark: "hsl(180, 100%, 30%)",
        light: "hsl(180, 100%, 70%)",
      },
    },
    borderWidth: {
      DEFAULT: "1px",
    },
    keyframes: {
      "cursor-blink": {
        "0%, 100%": { opacity: "1" },
        "50%": { opacity: "0" },
      },
    },
    animation: {
      "cursor-blink": "cursor-blink 1s step-end infinite",
    },
  },
},
```

**Why override `sans` with mono:** Every component in the codebase and shadcn/ui that uses `font-sans` (the default) will automatically get Geist Mono. This avoids hunting down every element that defaults to sans-serif.

**Confidence:** HIGH

### Layer 3: shadcn/ui Component Modifications

**Approach:** Modify the installed component files directly. shadcn/ui is copy-paste by design -- you own the code. Do NOT try to override via wrapper components.

#### Card (`components/ui/card.tsx`)
```
Before: "rounded-xl border bg-card text-card-foreground shadow"
After:  "border bg-card text-card-foreground"
```
- Remove `rounded-xl` (redundant when `--radius: 0rem`, but explicit is better)
- Remove `shadow` (terminal UIs use borders, not shadows)

#### Button (`components/ui/button.tsx`)
```
Before: "rounded-md text-sm font-medium ... shadow"
After:  "text-sm font-medium uppercase tracking-wider ..."
```
- Remove `rounded-md` (handled by --radius but be explicit)
- Remove `shadow`, `shadow-sm`
- Add `uppercase tracking-wider` for terminal button feel
- Add `border` to all variants for sharp definition

#### Badge (`components/ui/badge.tsx`)
```
Before: "rounded-md border px-2.5 py-0.5 text-xs font-semibold"
After:  "border px-2 py-0.5 text-xs font-mono uppercase tracking-wide"
```
- Remove `rounded-md`
- Add `uppercase tracking-wide` for terminal tag feel

#### Input fields
- Add `font-mono` (should inherit but enforce)
- Use `border` with visible border color
- Focus state: `ring-1 ring-cyan` (not thick ring)
- Placeholder text: use `>` prefix pattern for terminal feel

**Confidence:** HIGH -- shadcn/ui components are source code you modify. The Lyra style from the shadcn/ui December 2025 update validates this approach: zero radius, boxy components, mono fonts.

### Layer 4: Terminal-Specific CSS Effects

Add these to `globals.css` as utility classes:

```css
/* Blinking cursor for search input and hero text */
.terminal-cursor::after {
  content: "_";
  animation: cursor-blink 1s step-end infinite;
}

/* Subtle scan line overlay -- USE SPARINGLY */
.terminal-scanlines::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.03) 2px,
    rgba(0, 0, 0, 0.03) 4px
  );
  pointer-events: none;
  z-index: 1;
}

/* Terminal prompt prefix */
.terminal-prompt::before {
  content: "> ";
  color: hsl(180, 100%, 50%);
}

/* Type label styling -- replaces colorful badges */
.terminal-tag {
  @apply border border-border px-2 py-0.5 text-xs uppercase tracking-wider font-mono;
}
```

**What NOT to add:**
- No CRT screen curve effect (gimmicky, hurts usability)
- No heavy scanlines (distracting for a content directory)
- No phosphor glow / text-shadow glow (AI slop territory)
- No green-on-black (that is retro terminal, not modern terminal)
- No typing animation on page load (slow, annoying for returning users)

**Confidence:** HIGH for cursor blink (standard CSS animation, well-documented). MEDIUM for scanlines (subtle is key -- may need to remove if it hurts readability).

### Layer 5: Resource Card Terminal Redesign

The current resource-card.tsx uses colorful badges per type (blue for tool, purple for course, etc.). This violates the black/white/cyan constraint.

**Replace with:**
- ALL badges become monochrome: `border border-foreground/30 text-foreground text-xs uppercase`
- Type differentiation via TEXT PREFIX instead of color: `[TOOL]`, `[COURSE]`, `[ARTICLE]`
- Featured items: cyan border-left or cyan text prefix `* FEATURED`
- Tags: plain text with `|` separators instead of pill badges
- Free/Paid indicator: `FREE` or `PAID` in uppercase, no color

**Example card layout (terminal directory listing style):**
```
+------------------------------------------+
| [TOOL] Discovery              * FEATURED |
| cursor.com                               |
| by Anysphere                             |
|                                          |
| > AI-first code editor that changed...   |
|                                          |
| ai | code-editor | productivity          |
| FREE | EN                                |
+------------------------------------------+
```

**Confidence:** HIGH -- this directly implements the PROJECT.md requirement: "Resources feel like directory listings."

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Font | Geist Mono via next/font/google | JetBrains Mono, Fira Code | Geist Mono is bundled with Next.js ecosystem, no extra download. Project constraint says Geist Mono. |
| Style preset | Custom theme (manual CSS vars) | shadcn/ui Lyra preset | Lyra is close but uses its own color palette. Custom CSS vars give exact black/white/cyan. Lyra is useful as reference only. |
| Terminal effects | Minimal (cursor blink only) | Full CRT retro (scanlines, glow, curvature) | PROJECT.md explicitly says "NOT decorative." Restraint over spectacle. |
| Color approach | CSS variables only | Tailwind color palette expansion | CSS variables keep it centralized and shadcn/ui-compatible. |
| Component customization | Edit shadcn source files | Wrapper components | shadcn is designed to be modified in-place. Wrappers add unnecessary abstraction. |
| Theme mode | Force dark as default | System preference | Terminal = dark. The aesthetic demands it. Light mode as opt-in fallback only. |

## Anti-Patterns to Avoid

| Pattern | Why It Is Bad | What to Do Instead |
|---------|---------------|-------------------|
| Glassmorphism (backdrop-blur, glass borders) | AI slop. Every AI-generated landing page has it. | Solid borders, solid backgrounds |
| Gradient backgrounds | Breaks black/white/cyan constraint. Looks generic. | Solid `bg-background` |
| Neon glow / text-shadow on cyan | Looks like a 2023 "hacker" aesthetic. Overdone. | Plain `text-cyan` with no shadow |
| Rounded corners anywhere | Breaks terminal aesthetic. One rounded corner ruins it. | `--radius: 0rem` globally, remove any hardcoded `rounded-*` |
| Multiple accent colors | Violates palette constraint. | Cyan only. Gray for secondary. |
| Hover shadows / elevation on cards | Not how terminals work. | Hover: border color change to cyan, or subtle background shift |
| Colorful type badges (current impl) | 10 different colors for 10 types defeats monochrome. | Monochrome badges with text prefixes `[TOOL]` |
| Heavy animation / transitions | Terminals are instant. | Max `transition-colors duration-150`. No slide-ins. |
| Emoji or decorative icons | Terminals use text characters. | Use ASCII-style: `>`, `*`, `|`, `--`, `::` |

## Migration Path (Current to Terminal)

The existing codebase needs these specific changes:

### 1. globals.css (Replace CSS variables)
- Replace ALL `:root` and `.dark` variable values with terminal palette
- Set `--radius: 0rem`
- Add terminal utility classes (cursor-blink, terminal-prompt)

### 2. layout.tsx (Font swap)
- Change `import { Geist }` to `import { Geist_Mono }`
- Update className to use `geistMono.className`

### 3. tailwind.config.ts (Font + animation)
- Override `fontFamily.sans` and `fontFamily.mono` with Geist Mono variable
- Add cursor-blink keyframe and animation
- Optionally add explicit cyan color tokens

### 4. shadcn components (Remove rounded + shadow)
- `card.tsx`: Remove `rounded-xl`, remove `shadow`
- `button.tsx`: Remove `rounded-md`, remove `shadow`/`shadow-sm`, add `uppercase tracking-wider`
- `badge.tsx`: Remove `rounded-md`, add `uppercase tracking-wide`
- `input` in any component: Ensure `font-mono`, visible border

### 5. resource-card.tsx (Terminal listing style)
- Remove `typeColors` map entirely (no more colored badges)
- Replace with monochrome `[TYPE]` prefix pattern
- Remove `rounded-full` from tags
- Replace green/orange free/paid colors with plain uppercase text

### 6. ThemeProvider (Force dark)
- Change `defaultTheme="system"` to `defaultTheme="dark"`

## Installation

```bash
# No new packages needed. Everything is already installed.
# The terminal design is purely a configuration + styling change.

# If you wanted the `geist` npm package (NOT needed -- next/font/google works):
# npm install geist
```

## Sources

- [Geist Mono on Google Fonts](https://fonts.google.com/specimen/Geist+Mono) -- font availability confirmed
- [Next.js Font Optimization docs](https://nextjs.org/docs/app/getting-started/fonts) -- Geist_Mono import pattern
- [shadcn/ui Theming docs](https://ui.shadcn.com/docs/theming) -- CSS variable theming approach, --radius mechanism
- [shadcn/ui Lyra style](https://x.com/shadcn/status/1999530419125981676) -- "Boxy and sharp. Pairs well with mono fonts." Validates zero-radius approach
- [shadcn/ui December 2025 changelog](https://ui.shadcn.com/docs/changelog/2025-12-shadcn-create) -- Visual styles including Lyra
- [SMUI terminal theme for shadcn/ui](https://github.com/statico/smui) -- Reference implementation: Nord colors, JetBrains Mono, zero radius
- [CSS cursor blink technique](https://gist.github.com/kristofgilicze/46adbb34e46961da1d24abc976ac41c6) -- Pure CSS blinking cursor with step-end
- [Retro CRT terminal in CSS](https://dev.to/ekeijl/retro-crt-terminal-screen-in-css-js-4afh) -- Scanline reference (use sparingly)

---

*Stack research: 2026-03-12*
