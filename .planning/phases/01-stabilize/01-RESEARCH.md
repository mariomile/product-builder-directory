# Phase 1: Stabilize - Research

**Researched:** 2026-03-12
**Domain:** Next.js 16 / npm dependency pinning / Supabase template cleanup / Radix UI conflict resolution
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STAB-03 | All dependencies pinned to exact versions (no "latest") | npm pinning mechanics, lock file semantics, exact version resolution strategy documented |
| STAB-05 | Unused Supabase auth template boilerplate removed (auth pages, protected routes, theme switcher) | Full file inventory compiled; removal sequence and side-effect risks documented |
| QUAL-02 | Radix UI package conflicts resolved (meta-package vs individual packages) | Conflict root cause and both resolution strategies documented with trade-offs |
</phase_requirements>

---

## Summary

This phase has exactly three surgical jobs: pin floating versions in package.json, delete auth/tutorial boilerplate, and resolve the Radix UI dual-install conflict. None of these require new libraries or architectural decisions — the risk is in deletion side-effects and in choosing the correct Radix UI resolution strategy.

The codebase is a Supabase Next.js starter template that has been partially migrated into a real product. The real product code (resource-grid, search-bar, filters, resource-card) is clean and must not be touched. The boilerplate code (all of app/auth/, app/protected/, and a cluster of template components) must be deleted cleanly, with import references in app/page.tsx and app/layout.tsx updated.

**Primary recommendation:** Delete boilerplate first (no build risk), then fix Radix (build verification), then pin deps last (safest order — pinning can't break functionality).

---

## Standard Stack

### Core (already in project — no new installs needed)

| Library | Installed Version (lock) | Purpose | Status |
|---------|--------------------------|---------|--------|
| next | 16.1.6 | App framework | Pin to 16.1.6 |
| @supabase/ssr | 0.9.0 | Supabase SSR helpers | Pin to 0.9.0 |
| @supabase/supabase-js | 2.99.1 | Supabase client | Pin to 2.99.1 |
| radix-ui | 1.4.3 (meta-package) | Radix bundle — CONFLICTS | Remove (see QUAL-02) |
| @radix-ui/react-checkbox | ^1.3.1 | Checkbox primitive | Keep, pin |
| @radix-ui/react-dropdown-menu | ^2.1.14 | Dropdown primitive | Keep, pin |
| @radix-ui/react-label | ^2.1.6 | Label primitive | Keep, pin |
| @radix-ui/react-slot | ^1.2.2 | Slot primitive | Keep, pin |
| next-themes | ^0.4.6 | Theme provider | Remove with theme switcher |

### No New Installations Required

This phase is purely cleanup. Zero new packages.

---

## Architecture Patterns

### What Gets Deleted vs What Gets Kept

```
app/
├── auth/               DELETE ENTIRE DIRECTORY (7 files)
│   ├── error/page.tsx
│   ├── forgot-password/page.tsx
│   ├── login/page.tsx
│   ├── sign-up-success/page.tsx
│   ├── sign-up/page.tsx
│   └── update-password/page.tsx
├── protected/          DELETE ENTIRE DIRECTORY (2 files)
│   ├── layout.tsx
│   └── page.tsx
├── layout.tsx          MODIFY: remove ThemeProvider wrapper, remove ThemeProvider import
├── page.tsx            MODIFY: remove ThemeSwitcher import and JSX usage
└── resources/          KEEP UNTOUCHED
    └── [slug]/page.tsx

components/
├── auth-button.tsx         DELETE
├── deploy-button.tsx       DELETE
├── env-var-warning.tsx     DELETE
├── forgot-password-form.tsx DELETE
├── hero.tsx               DELETE
├── login-form.tsx          DELETE
├── logout-button.tsx       DELETE
├── next-logo.tsx           DELETE
├── sign-up-form.tsx        DELETE
├── supabase-logo.tsx       DELETE
├── theme-switcher.tsx      DELETE
├── update-password-form.tsx DELETE
├── tutorial/               DELETE ENTIRE DIRECTORY (5 files)
│   ├── code-block.tsx
│   ├── connect-supabase-steps.tsx
│   ├── fetch-data-steps.tsx
│   ├── sign-up-user-steps.tsx
│   └── tutorial-step.tsx
├── filters.tsx             KEEP
├── resource-card.tsx       KEEP
├── resource-grid.tsx       KEEP
├── search-bar.tsx          KEEP
└── ui/                     KEEP ALL
```

### Pattern 1: Dependency Pinning

**What:** Replace `"latest"` and `"^x.y.z"` specifiers with exact resolved versions from package-lock.json.

**How npm exact pinning works:** When package.json specifies `"1.2.3"` (no prefix), npm installs exactly that version every time. The lock file becomes a guarantee rather than a suggestion. A fresh `npm install` with `"latest"` re-resolves to the current latest — drift is guaranteed on future installs.

**Exact versions to write into package.json (sourced from package-lock.json):**

```json
{
  "next": "16.1.6",
  "@supabase/ssr": "0.9.0",
  "@supabase/supabase-js": "2.99.1"
}
```

All other `^` ranges should also be pinned to their currently resolved versions. Read from package-lock.json `"version"` field for each top-level dependency.

**Why not `npm shrinkwrap`:** The lock file already pins transitive deps. Pinning in package.json covers the direct deps that drift.

### Pattern 2: ThemeProvider Removal

app/layout.tsx currently wraps children in `<ThemeProvider>`. After removing:

```typescript
// Before (remove these imports and JSX)
import { ThemeProvider } from "next-themes";

// Before body:
<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
  {children}
</ThemeProvider>

// After body:
{children}
```

The `suppressHydrationWarning` on `<html>` was placed there specifically for next-themes hydration. It can remain — it is harmless without ThemeProvider — or be removed. Removing it is cleaner but not required for functionality.

`next-themes` itself can be uninstalled after removal since it will be unused. Pin it to its resolved version first if keeping, or remove it entirely from package.json.

### Pattern 3: Radix UI Conflict Resolution (QUAL-02)

**Root cause:** The codebase has both:
1. `radix-ui` (meta-package, ^1.4.3) — installs ALL Radix primitives as a bundle
2. Individual `@radix-ui/react-*` packages — the specific primitives actually used

These two installation paths install the same primitive packages twice (e.g., `@radix-ui/react-checkbox` appears as a direct dep AND as a transitive dep of `radix-ui`). This causes React peer dependency warnings because two instances of the same package at different versions can coexist in node_modules.

**Resolution Strategy: Remove the meta-package (RECOMMENDED)**

The shadcn/ui components in `components/ui/` import from `@radix-ui/react-*` individual packages directly:
- `components/ui/dropdown-menu.tsx` imports from `@radix-ui/react-dropdown-menu`
- `components/ui/checkbox.tsx` imports from `@radix-ui/react-checkbox`
- `components/ui/label.tsx` imports from `@radix-ui/react-label`
- button uses `@radix-ui/react-slot`

No file in the codebase imports from the `radix-ui` meta-package directly. Removing it eliminates the conflict without any code changes.

```bash
npm uninstall radix-ui
```

After uninstall, verify in package.json that `radix-ui` is gone and the individual `@radix-ui/react-*` packages remain.

**Alternative: Keep meta-package, remove individuals** — Do NOT do this. The meta-package exports may have different API surfaces than the individual packages in some edge cases, and shadcn/ui is tested against the individual packages. Changing the import source of the UI primitives adds risk with no benefit.

### Anti-Patterns to Avoid

- **Deleting components/ui/ primitives:** The files in `components/ui/` (badge.tsx, button.tsx, card.tsx, etc.) are real product components used by the working app. Do not delete them.
- **Removing ThemeProvider without removing the import:** TypeScript will error at build time. Must update both the import and the JSX.
- **Pinning with caret ranges:** `"^16.1.6"` still allows minor/patch drift. Use `"16.1.6"` bare.
- **Running `npm install` before pinning:** If run before package.json is updated, `"latest"` will re-resolve to whatever is current that day, potentially upgrading and changing the lock file. Pin first, then install.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Version pinning | Script to parse lock file | Manual: read lock file, copy versions to package.json | It's 3 version strings — over-engineering |
| Conflict detection | Custom analysis | `npm ls <package>` | Built into npm |
| Post-delete broken imports | Regex search | IDE/TypeScript compiler errors after build | TypeScript catches broken imports at compile time |

**Key insight:** All three tasks in this phase are manual edits, not code. No tooling is needed beyond `npm install` and `npm run build` for verification.

---

## Common Pitfalls

### Pitfall 1: Leaving hasEnvVars in lib/utils.ts

**What goes wrong:** `lib/utils.ts` exports `hasEnvVars` which is imported by `app/protected/layout.tsx`. When the protected layout is deleted, the export becomes unused but harmless. However, `hasEnvVars` checks `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — a non-standard env var name. If this export is referenced anywhere post-deletion it will silently return undefined.

**How to avoid:** After deleting the protected layout, confirm `hasEnvVars` has no remaining importers. Leave it in utils.ts (it's harmless) or delete it — it is not needed by real app code.

### Pitfall 2: app/protected/layout.tsx imports trigger build failure

**What goes wrong:** `app/protected/layout.tsx` imports `DeployButton`, `EnvVarWarning`, `AuthButton`, `ThemeSwitcher`. If you delete the layout without verifying the imports are also deleted, you get stale import artifacts in git. This does not cause a build error (the files exist), but when those components are subsequently deleted, the layout would fail to resolve.

**How to avoid:** Delete directories atomically (entire `app/auth/` and `app/protected/` at once) before deleting individual components they reference. Never delete a component before all its consumers.

### Pitfall 3: next-themes peer warning persists after ThemeProvider removal

**What goes wrong:** If `next-themes` remains in package.json after ThemeProvider is removed, it's unused dead weight and may trigger a peer dependency check warning if its React version range doesn't exactly match installed React.

**How to avoid:** Remove `next-themes` from package.json as part of theme switcher cleanup.

### Pitfall 4: Radix UI version mismatch after meta-package removal

**What goes wrong:** `radix-ui` 1.4.3 pins `@radix-ui/react-checkbox` to 1.3.3 internally. The direct `@radix-ui/react-checkbox: "^1.3.1"` in package.json could resolve to a different patch (1.3.1 or 1.3.2) after meta-package is removed and npm re-resolves.

**How to avoid:** After running `npm uninstall radix-ui`, check the installed versions of the individual Radix packages (`npm ls @radix-ui/react-checkbox`). Pin each to the newly resolved exact version.

### Pitfall 5: Build passes but console warnings remain

**What goes wrong:** Peer dependency warnings appear at `npm install` time, not at `npm run build` time. The build can succeed with 0 errors while install still emits warnings.

**How to avoid:** Verify with `npm install 2>&1 | grep -E "WARN|peer"` — the success criterion is zero peer dependency warnings, not just a clean build.

---

## Code Examples

### Pinned package.json dependencies section

```json
{
  "dependencies": {
    "@radix-ui/react-checkbox": "1.3.1",
    "@radix-ui/react-dropdown-menu": "2.1.14",
    "@radix-ui/react-label": "2.1.6",
    "@radix-ui/react-slot": "1.2.2",
    "@supabase/ssr": "0.9.0",
    "@supabase/supabase-js": "2.99.1",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "lucide-react": "0.511.0",
    "next": "16.1.6",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "tailwind-merge": "3.3.0"
  },
  "devDependencies": {
    "@eslint/eslintrc": "3.3.0",
    "@types/node": "20.17.30",
    "@types/react": "19.1.0",
    "@types/react-dom": "19.1.2",
    "autoprefixer": "10.4.20",
    "eslint": "9.24.0",
    "eslint-config-next": "16.1.6",
    "postcss": "8.5.3",
    "tailwindcss": "3.4.1",
    "tailwindcss-animate": "1.0.7",
    "typescript": "5.8.3"
  }
}
```

Note: Exact devDependency versions must be read from package-lock.json at execution time — the values above are illustrative. `eslint-config-next` version must match `next` version exactly.

### app/layout.tsx after ThemeProvider removal

```typescript
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Product Builder Directory",
  description:
    "Evita il noise. Solo le migliori risorse sul Product Building, testate e curate da un team di esperti.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

### app/page.tsx nav section after ThemeSwitcher removal

```typescript
{/* Nav */}
<nav className="w-full flex justify-center border-b border-border/50 h-14">
  <div className="w-full max-w-6xl flex justify-between items-center px-5">
    <span className="font-semibold text-sm">
      Product Builder Directory
    </span>
  </div>
</nav>
```

Remove the `import { ThemeSwitcher } from "@/components/theme-switcher";` line and the `<ThemeSwitcher />` JSX element.

### Verify no peer warnings after fix

```bash
npm install 2>&1 | grep -iE "warn|peer dep"
```

Expected output: empty (no warnings).

---

## State of the Art

| Old Approach | Current Approach | Impact for This Phase |
|--------------|------------------|-----------------------|
| `shrinkwrap` for pinning | Exact versions in package.json + lock file | Use bare version strings in package.json |
| Individual `@radix-ui/*` packages only | `radix-ui` meta-package introduced in ~2024 | Meta-package conflicts with individual installs — remove it |
| `ThemeProvider` required for dark mode control | CSS-only dark mode via `class` on `<html>` | ThemeProvider can be removed; dark mode will be forced in Phase 2 via CSS |

**Deprecated/outdated:**
- `radix-ui` meta-package: Useful when starting fresh with no individual packages. Not compatible with shadcn/ui's pattern of individual package installs. Remove it.
- `next-themes` ThemeProvider: Required for toggle-based theme switching. Not needed when dark mode is forced (Phase 2). Remove it now as part of boilerplate cleanup.

---

## Open Questions

1. **Exact devDependency resolved versions**
   - What we know: `"^3"` for `@eslint/eslintrc`, `"^20"` for `@types/node`, etc.
   - What's unclear: The exact resolved patch versions in the lock file (not read in full)
   - Recommendation: The planner's execution task should read the full package-lock.json to extract each devDependency's exact version before writing the pinned package.json

2. **eslint-config-next version alignment**
   - What we know: `eslint-config-next` is pinned to `15.3.1` in package.json but Next.js resolved to `16.1.6`
   - What's unclear: Whether this version mismatch is intentional or an artifact
   - Recommendation: Pin `eslint-config-next` to `16.1.6` to match Next.js — mismatched versions can cause lint rule conflicts

3. **`suppressHydrationWarning` on `<html>`**
   - What we know: It was added for next-themes hydration mismatch prevention
   - What's unclear: Whether any other mechanism in the app triggers hydration mismatches
   - Recommendation: Remove it when removing ThemeProvider. If hydration warnings appear in dev, re-add it. This is low-risk.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no test files or test config exist |
| Config file | None — Wave 0 must create |
| Quick run command | `npm run build` (TypeScript compilation as proxy for correctness) |
| Full suite command | `npm run build && npm install 2>&1 \| grep -iE "warn\|peer"` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STAB-03 | npm install on fresh clone produces identical node_modules | smoke | `npm ci --dry-run` (no drift = clean exit) | N/A — command |
| STAB-05 | No auth/protected/theme-switcher paths exist | smoke | `ls app/auth app/protected components/theme-switcher.tsx 2>&1 \| grep -c "No such"` (expect 3) | N/A — command |
| QUAL-02 | Zero peer dependency warnings | smoke | `npm install 2>&1 \| grep -iE "warn\|peer dep"` (expect empty) | N/A — command |

No Jest/Vitest/pytest infrastructure exists. All verification for this phase is shell-command-level smoke testing against observable filesystem and npm output.

### Sampling Rate
- **Per task:** `npm run build` — confirms TypeScript compiles without broken import errors
- **Per wave:** `npm run build && npm install 2>&1 | grep -iE "warn|peer"` — confirms build clean and no peer warnings
- **Phase gate:** All three success criteria verified before `/gsd:verify-work`

### Wave 0 Gaps
- No test framework installation needed — this phase has no unit-testable logic
- Shell command verifications documented above are sufficient for the three requirements

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection: package.json, package-lock.json, all app/ and components/ files
- npm documentation (knowledge): exact version pinning semantics — no prefix means exact

### Secondary (MEDIUM confidence)
- shadcn/ui documentation pattern: individual `@radix-ui/react-*` packages are the correct install target for shadcn/ui components
- Radix UI GitHub: `radix-ui` meta-package was introduced as a convenience wrapper; shadcn/ui does not use it

### Tertiary (LOW confidence — not needed, everything found in codebase)
- None

---

## Metadata

**Confidence breakdown:**
- File inventory: HIGH — read directly from filesystem
- Version numbers: HIGH — read directly from package-lock.json
- Radix conflict root cause: HIGH — confirmed by inspecting both package.json and individual UI component imports
- Pinning mechanics: HIGH — standard npm behavior, well-established
- Deletion side-effects: HIGH — traced all imports manually

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable domain — npm pinning mechanics don't change)
