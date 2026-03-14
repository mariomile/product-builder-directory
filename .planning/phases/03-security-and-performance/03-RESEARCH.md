# Phase 3: Security and Performance — Research

**Researched:** 2026-03-13
**Domain:** Next.js 15 App Router security hardening, PostgREST injection, Supabase RLS, edge function auth, URL-driven pagination, search debounce
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SECR-01 | Search query sanitized to prevent PostgREST filter injection | Whitelist-strip approach in `getResources` — strip special chars from `params.search` before interpolating into `.or()` ilike filter |
| SECR-02 | RLS DELETE policy added to resources table | New SQL migration: `CREATE POLICY "Authenticated delete" ON resources FOR DELETE USING (auth.role() = 'authenticated')` |
| SECR-03 | Raindrop sync edge function requires authorization header | Add `Authorization` header check in `Deno.serve` handler before executing any logic |
| SECR-04 | Required environment variables validated at startup with clear error messages | `instrumentation.ts` (Next.js 15 stable) or `lib/env.ts` with explicit throws at module load |
| PERF-01 | Resources paginated at 20 items per page with cursor-based navigation | Add `.range(offset, offset+19)` to Supabase query; `page` URL param drives offset; Prev/Next buttons preserve all active filters |
| PERF-02 | Filtered result count displayed to user (not just total count) | Pass `{ count: 'exact' }` to the filtered query; display as "X results" vs "Y total" |
| STAB-01 | Search input debounces 300ms before triggering server navigation | Replace `onChange` immediate call with `useRef` + `setTimeout`/`clearTimeout` pattern in `search-bar.tsx` |
</phase_requirements>

---

## Summary

Phase 3 is seven surgical changes across four files and one new SQL migration. No new npm dependencies are needed. The codebase is a Next.js 15 App Router app with a Supabase backend; search and filters are URL-driven via `router.push`, and data fetching happens in server components using `lib/queries.ts`.

The two highest-risk items are the PostgREST injection (SECR-01) and the pagination architecture (PERF-01). The injection vector is live and exploitable today: `params.search` is string-interpolated directly into a PostgREST `.or()` filter. The fix is a one-liner sanitizer in `getResources`. Pagination requires the most code change — new URL param (`page`), updated query function returning `{data, count, total}`, and a new `PaginationBar` client component.

**Primary recommendation:** Implement in two plans — Plan 03-01: Security (SECR-01, SECR-02, SECR-03, SECR-04) and Plan 03-02: Performance (PERF-01, PERF-02, STAB-01). Security changes are independent of each other; performance changes share the `getResources` query function and the `ResourceGrid` component.

---

## Standard Stack

### Core (already installed — no new deps needed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | `instrumentation.ts` for env validation | Built-in module init hook, stable in Next.js 15+ |
| @supabase/supabase-js | 2.99.1 | `.range()` for pagination, count option | Already in use |
| React | 19.2.4 | `useRef` + `useCallback` for debounce | No lodash needed, native hooks sufficient |

### No New Dependencies Needed
All seven requirements are implementable with the existing stack. Lodash debounce is NOT needed — a `useRef`-based timer is idiomatic React and avoids a dependency.

---

## Architecture Patterns

### Recommended Project Structure (new files only)
```
app/
└── instrumentation.ts          # SECR-04: env validation at startup
components/
└── pagination-bar.tsx          # PERF-01: Prev/Next navigation
lib/
└── queries.ts                  # Modified: sanitizer + pagination + filtered count
supabase/
└── migrations/
    └── 003_rls_delete.sql      # SECR-02: DELETE policy
supabase/functions/sync-raindrop/
└── index.ts                    # Modified: auth header check
```

### Pattern 1: PostgREST Injection Sanitization (SECR-01)

**What:** PostgREST `.or()` filters accept operator syntax like `name.ilike.%value%`. If the user types `,description.eq.secret`, the raw interpolation inserts it as a second filter condition. The fix is to strip all characters that PostgREST uses for filter construction before interpolation.

**When to use:** Any time user input is interpolated into a PostgREST filter string.

**Characters to strip:** `,`, `(`, `)`, `.`, `*`, `%`, `"`, `'`, `\`, `;`, `|`

**Example:**
```typescript
// In lib/queries.ts — BEFORE the ilike interpolation
function sanitizeSearch(raw: string): string {
  // Strip PostgREST operator characters that could alter filter logic
  return raw.replace(/[,().%"'\\;|*]/g, "").trim().slice(0, 100);
}

// Usage in getResources:
if (params.search) {
  const safe = sanitizeSearch(params.search);
  if (safe) {
    query = query.or(
      `name.ilike.%${safe}%,description.ilike.%${safe}%,expert_take.ilike.%${safe}%`
    );
  }
}
```

**Why this works:** The ilike wildcard `%` in the template is controlled code, not user input. The injected value `safe` can only contain alphanumeric chars and spaces — no PostgREST control characters.

### Pattern 2: RLS DELETE Policy (SECR-02)

**What:** The current `001_init.sql` has SELECT (public), INSERT (authenticated), UPDATE (authenticated) policies — but no DELETE policy. With RLS enabled, a missing policy means the operation is denied by default for all roles. However, explicitly defining it is the correct practice.

**Example — `003_rls_delete.sql`:**
```sql
-- Add DELETE policy to resources table
-- Matches pattern of existing INSERT/UPDATE policies
CREATE POLICY "Authenticated delete"
  ON resources FOR DELETE
  USING (auth.role() = 'authenticated');
```

**Note:** Since Phase 4 uses `SUPABASE_SERVICE_ROLE_KEY` in the edge function (which bypasses RLS), this policy affects only anon/authenticated JWT-based clients.

### Pattern 3: Edge Function Authorization Header (SECR-03)

**What:** The current `Deno.serve` handler in `sync-raindrop/index.ts` accepts any GET or POST request with no authentication. The fix is to check for a `Authorization: Bearer <secret>` header before executing any logic.

**Example — added at the top of the request handler:**
```typescript
Deno.serve(async (req) => {
  // Reject requests without valid authorization
  const authHeader = req.headers.get("Authorization");
  const expectedToken = Deno.env.get("SYNC_SECRET");
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // ... existing logic unchanged
  }
});
```

**`SYNC_SECRET`** is a new edge function secret (not a Next.js env var). Set via Supabase Dashboard → Edge Functions → Secrets. The cron trigger in Supabase passes this header automatically when configured.

**Note:** Supabase's built-in cron trigger for edge functions can be configured with a JWT or a custom header. Using a simple shared secret is the standard pattern for self-invoked cron edge functions.

### Pattern 4: Environment Variable Validation (SECR-04)

**What:** Next.js 15 introduced stable `instrumentation.ts` at the project root. Its `register()` function runs once when the Next.js server starts, before any request is handled. This is the correct place for fail-fast env validation.

**Example — `instrumentation.ts`:**
```typescript
export async function register() {
  // Only validate on the server (not during edge runtime or client bundles)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const required = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(
        `[startup] Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\nSee .env.example for required values.`
      );
    }
  }
}
```

**Why `instrumentation.ts` and not a module-level check in `lib/supabase/server.ts`:** Module-level throws happen lazily (first import). `instrumentation.ts` runs eagerly before any route is served, which produces a clear startup crash vs a runtime 500.

**Required vars for this app:**
- `NEXT_PUBLIC_SUPABASE_URL` — used by both client and server Supabase clients
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — anon/publishable key

### Pattern 5: Offset-Based Pagination with URL `page` Param (PERF-01 + PERF-02)

**What:** Resources are currently fetched with `.order(...).order(...)` and no limit. Add `.range(offset, offset + PAGE_SIZE - 1)` and return both `data` and `count` (filtered count) from `getResources`.

**Architecture decision:** Offset-based (not cursor-based). Rationale: the data is ordered by `is_featured DESC, created_at DESC` — a stable sort for a small, slow-changing dataset. Cursor-based pagination adds complexity (opaque cursors, no page number display) that is not warranted here.

**Updated `getResources` signature:**
```typescript
const PAGE_SIZE = 20;

export async function getResources(params: {
  search?: string;
  type?: string;
  pillar?: string;
  level?: string;
  free?: string;
  page?: string;        // NEW: "1"-based page number from URL
}): Promise<{ data: Resource[]; filteredCount: number; totalPages: number }> {
  const supabase = await createClient();
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from("resources")
    .select("*", { count: "exact" });   // count: "exact" returns filtered count

  // ... filters applied ...

  const { data, count, error } = await query
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) throw error;
  const filteredCount = count ?? 0;
  return {
    data: data as Resource[],
    filteredCount,
    totalPages: Math.ceil(filteredCount / PAGE_SIZE),
  };
}
```

**`PaginationBar` client component** reads `page` from `useSearchParams()` and renders Prev/Next buttons that call `router.push` with `page` param updated while preserving all other filter params.

**`ResourceGrid` changes:**
- Receives `page` from `searchParams`
- Passes it to `getResources`
- Displays "Showing X–Y of Z results" using `filteredCount`
- Renders `<PaginationBar currentPage={page} totalPages={totalPages} />`

**`getResourceCount()` function:** Can be removed or kept for the nav "total resources" count. PERF-02 requires showing the *filtered* count, which `getResources` now provides directly.

### Pattern 6: Debounce in SearchBar (STAB-01)

**What:** Currently `onChange` calls `handleSearch` immediately, causing a `router.push` on every keystroke. Replace with a `useRef`-held timer.

**Example:**
```typescript
const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleSearch = useCallback(
  (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      startTransition(() => {
        router.push(`/?${params.toString()}`);
      });
    }, 300);
  },
  [router, searchParams]
);
```

**Why not `useDebounce` hook from a library:** No library needed. The pattern is 6 lines. Adding a dependency for this is unnecessary given the 5-day deadline.

### Anti-Patterns to Avoid

- **Cursor-based pagination for this dataset:** Adds opaque cursor state, complicates URL sharing, offers no real benefit for <200 items ordered by a stable compound key.
- **Zod for env validation at startup:** Overkill — a simple `Array.filter` check with a descriptive `throw` is clearer and has no import overhead.
- **Stripping only `%` from search input:** Insufficient — PostgREST injection uses `,` and `(` to append filter conditions. Must strip the full operator character set.
- **Validating env vars inside `lib/supabase/server.ts`:** Lazy module evaluation means the error only surfaces on the first request, not at startup.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Search debounce | Custom debounce utility function | `useRef` + `setTimeout` directly | 6 lines, no dep, already in scope |
| Pagination state | Redux/Zustand store for page | URL `?page=N` param | Server-renderable, shareable URL, consistent with existing filter pattern |
| Input sanitization | HTML-encode or escape library | Simple `.replace()` regex | Only need to strip 11 specific chars, not full HTML encoding |
| Env validation | `dotenv-safe`, `envalid`, `zod` | `instrumentation.ts` with explicit check | No new dep, built-in Next.js hook |

---

## Common Pitfalls

### Pitfall 1: PostgREST Injection via `.or()` String Interpolation
**What goes wrong:** User types `%,description.eq.secret` — the ilike filter becomes `name.ilike.%%,description.eq.secret%,...` which changes query semantics.
**Why it happens:** The current code directly interpolates `params.search` into the filter string without sanitization.
**How to avoid:** `sanitizeSearch()` runs before any interpolation. The function removes `,`, `(`, `)` which are the PostgREST filter separators.
**Warning signs:** Search returning results that should not match, or DB errors about malformed filter syntax.

### Pitfall 2: `count: "exact"` Changes Supabase Response Shape
**What goes wrong:** Adding `{ count: "exact" }` to `.select()` changes the destructured response from `{ data, error }` to `{ data, count, error }`. Forgetting to destructure `count` means the filtered count is always `null`.
**Why it happens:** Supabase JS SDK returns `count` as a top-level field only when explicitly requested.
**How to avoid:** Update `getResources` return type and all call sites in `ResourceGrid` simultaneously.

### Pitfall 3: `page` URL Param Preserved Across Filter Changes
**What goes wrong:** User is on page 3, changes a filter — now they're on page 3 of a result set that may only have 1 page. Shows "No results" even though page 1 has results.
**Why it happens:** `FilterGroup` and `SearchBar` preserve all current URL params (including `page`) when pushing new filter values.
**How to avoid:** When any filter other than `page` changes, reset `page` to 1. In `FilterGroup.handleFilter` and `SearchBar.handleSearch`, delete the `page` param before pushing.
**Warning signs:** "No results found" on filtered searches when unfiltered shows results.

### Pitfall 4: Edge Function Auth Header Bypasses Cron Trigger
**What goes wrong:** Adding auth check breaks Supabase's built-in cron trigger which doesn't pass a custom header by default.
**Why it happens:** Supabase cron for edge functions sends a JWT in `Authorization`, but the format is `Bearer <supabase-jwt>`, not `Bearer <SYNC_SECRET>`.
**How to avoid:** Two options: (A) Accept both a Supabase cron JWT and the SYNC_SECRET — or (B) since Phase 4 configures the cron, document that SYNC_SECRET must be set in the cron invocation config. **Recommendation:** Use option B — the cron is not set up yet (Phase 4), so keep it simple: require SYNC_SECRET on all requests. Phase 4 will configure the cron header.

### Pitfall 5: `instrumentation.ts` Runs in Edge Runtime Too
**What goes wrong:** Without the `process.env.NEXT_RUNTIME === "nodejs"` guard, the env check runs in the edge runtime where `process.env` access differs.
**Why it happens:** Next.js 15 instrumentation runs in both Node.js and edge runtimes by default.
**How to avoid:** Wrap validation in `if (process.env.NEXT_RUNTIME === "nodejs")` block.

---

## Code Examples

### Sanitize + Paginate in `getResources`
```typescript
// lib/queries.ts
const PAGE_SIZE = 20;

function sanitizeSearch(raw: string): string {
  return raw.replace(/[,().%"'\\;|*]/g, "").trim().slice(0, 100);
}

export async function getResources(params: {
  search?: string;
  type?: string;
  pillar?: string;
  level?: string;
  free?: string;
  page?: string;
}) {
  const supabase = await createClient();
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase.from("resources").select("*", { count: "exact" });

  if (params.search) {
    const safe = sanitizeSearch(params.search);
    if (safe) {
      query = query.or(
        `name.ilike.%${safe}%,description.ilike.%${safe}%,expert_take.ilike.%${safe}%`
      );
    }
  }
  if (params.type) query = query.eq("type", params.type);
  if (params.pillar) query = query.eq("pillar", params.pillar);
  if (params.level) query = query.eq("level", params.level);
  if (params.free === "true") query = query.eq("is_free", true);
  if (params.free === "false") query = query.eq("is_free", false);

  const { data, count, error } = await query
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) throw error;
  return {
    data: data as Resource[],
    filteredCount: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
    currentPage: page,
  };
}
```

### PaginationBar Component
```typescript
// components/pagination-bar.tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function PaginationBar({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const navigate = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }
    startTransition(() => router.push(`/?${params.toString()}`));
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <button
        onClick={() => navigate(currentPage - 1)}
        disabled={currentPage <= 1 || isPending}
        className="disabled:opacity-30 hover:text-foreground"
      >
        &lt; prev
      </button>
      <span>
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => navigate(currentPage + 1)}
        disabled={currentPage >= totalPages || isPending}
        className="disabled:opacity-30 hover:text-foreground"
      >
        next &gt;
      </button>
    </div>
  );
}
```

### Reset `page` on Filter/Search Change
```typescript
// In FilterGroup.handleFilter and SearchBar.handleSearch:
const params = new URLSearchParams(searchParams.toString());
params.delete("page"); // Reset to page 1 on any filter change
// ... then set the new filter value
```

### Edge Function Auth Check
```typescript
// supabase/functions/sync-raindrop/index.ts — top of Deno.serve handler
const authHeader = req.headers.get("Authorization");
const expectedToken = Deno.env.get("SYNC_SECRET");
if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
  return new Response("Unauthorized", { status: 401 });
}
```

### RLS DELETE Migration
```sql
-- supabase/migrations/003_rls_delete.sql
CREATE POLICY "Authenticated delete"
  ON resources FOR DELETE
  USING (auth.role() = 'authenticated');
```

### instrumentation.ts
```typescript
// instrumentation.ts (project root)
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const required = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(
        `[startup] Missing required environment variables:\n` +
          missing.map((k) => `  - ${k}`).join("\n") +
          `\n\nSee .env.example for required values.`
      );
    }
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `pages/` router `getServerSideProps` for URL-driven state | App Router `searchParams` prop on Server Components | Next.js 13+ | searchParams is a Promise in Next.js 15 — already handled correctly in this codebase |
| `next-env` or `dotenv-safe` for env validation | `instrumentation.ts` | Next.js 15 stable | No extra package needed |
| `useDebounce` hooks library | Native `useRef` + `setTimeout` | Always available | Simpler, no dep |

**Deprecated/outdated in this context:**
- `getResourceCount()` as a separate query: once `getResources` returns `filteredCount`, the separate total count call in `ResourceGrid` can be replaced with a single query. The nav-level "X resources curated" count can stay as-is or use `filteredCount` — planner should decide.

---

## Open Questions

1. **Filtered count display wording (PERF-02)**
   - What we know: PERF-02 says "filtered result count displayed, not just total count"
   - What's unclear: The current ResourceGrid already shows `{resources.length} results` when filters are active. PERF-02 may mean showing the count *before* pagination truncates it (i.e., "42 results, showing 1–20").
   - Recommendation: Show "X results" above the grid (filtered count from DB) plus "Showing N–M" in the pagination bar. Planner should confirm wording matches the success criterion.

2. **`page` param in `app/page.tsx` SearchParams type**
   - What we know: `SearchParams` type in `app/page.tsx` does not currently include `page`.
   - What's unclear: Minor — just needs to be added to the type and passed through to `ResourceGrid`.
   - Recommendation: Planner should include this type update in the pagination task.

3. **`getResourceCount()` fate**
   - What we know: It fetches total count (no filters). Once pagination is added, `getResources` returns `filteredCount`. The `ResourceGrid` calls both currently.
   - Recommendation: Keep `getResourceCount()` for the footer/nav-level "N resources curated" counter. Remove the `getResourceCount()` import from `ResourceGrid` and use the `filteredCount` returned by `getResources` instead.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed — no test infrastructure exists in this project |
| Config file | None |
| Quick run command | `npm run build` (type-check + build as proxy for correctness) |
| Full suite command | `npm run build && npm run lint` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SECR-01 | `sanitizeSearch(",description.eq.secret")` returns a string with no `,` or `.` | manual-only | Verify in browser: type injection payload, confirm zero results | N/A |
| SECR-02 | DELETE policy exists in migration file | manual-only | `grep -r "DELETE" supabase/migrations/` | ❌ Wave 0 |
| SECR-03 | Edge function returns 401 without auth header | manual-only | `curl -s -o /dev/null -w "%{http_code}" https://<fn-url>` → must be 401 | N/A |
| SECR-04 | Startup throws on missing env var | build | `npm run build` catches module errors | N/A |
| PERF-01 | Page 1 returns ≤20 items; page 2 returns next batch | manual-only | Browser check: seed 25+ rows, verify pagination | N/A |
| PERF-02 | Filtered count shown matches actual filtered DB count | manual-only | Apply filter, count visible cards, compare to displayed count | N/A |
| STAB-01 | Single navigation per search after typing stops | manual-only | DevTools Network tab: confirm one request per search burst | N/A |

**Note on manual-only:** This is a pre-infrastructure phase (no live DB yet). Automated integration tests against Supabase would require Phase 4 infrastructure. All verification is via `npm run build` + `npm run lint` + browser smoke tests once Phase 4 infra is ready.

### Sampling Rate
- **Per task commit:** `npm run build && npm run lint`
- **Per wave merge:** `npm run build && npm run lint`
- **Phase gate:** Build green + manual browser smoke test before `/gsd:verify-work`

### Wave 0 Gaps
- None for test framework — no test infra is being added in this phase
- `npm run build` serves as the compile-time correctness gate (TypeScript + Next.js bundler)

*(No test files need to be created. Build + lint is the adequate gate for this phase's changes.)*

---

## Sources

### Primary (HIGH confidence)
- Supabase JS SDK docs (supabase.com/docs/reference/javascript) — `.range()`, `{ count: "exact" }`, RLS policy syntax
- Next.js docs (nextjs.org/docs/app/building-your-application/optimizing/instrumentation) — `instrumentation.ts` pattern
- Direct code inspection of `lib/queries.ts`, `components/search-bar.tsx`, `supabase/functions/sync-raindrop/index.ts`, `supabase/migrations/001_init.sql`

### Secondary (MEDIUM confidence)
- PostgREST filter injection vector: derived from PostgREST `.or()` string syntax documentation and direct inspection of the interpolation in `getResources`
- Supabase edge function authorization pattern: derived from Supabase edge function docs and Deno.serve patterns

### Tertiary (LOW confidence)
- Supabase cron trigger JWT header format: not directly verified. Recommendation to defer cron auth to Phase 4 is conservative and safe regardless.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all changes use already-installed libraries
- Architecture: HIGH — patterns derived from direct code inspection + official docs
- Pitfalls: HIGH — injection and pagination pitfalls derived from live code analysis, not speculation
- Validation: MEDIUM — no test infra exists; manual verification is the honest answer

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable libraries, low churn domain)
