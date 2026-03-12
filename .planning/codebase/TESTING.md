# Testing Patterns

**Analysis Date:** 2026-03-12

## Test Framework

**Runner:**
- No test framework is installed or configured
- No test files exist in the codebase
- No test scripts in `package.json`

**Status:** Testing infrastructure is entirely absent. This is a greenfield gap.

## Recommended Setup

Based on the stack (Next.js 15, React 19, TypeScript 5), the recommended test setup is:

**Unit/Component Testing:**
- Vitest (fast, native ESM/TypeScript, compatible with Next.js)
- `@testing-library/react` for component testing
- `@testing-library/user-event` for interaction simulation

**Install:**
```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Config file to create:** `vitest.config.ts`
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

**Setup file to create:** `vitest.setup.ts`
```typescript
import "@testing-library/jest-dom/vitest";
```

**Add to `package.json` scripts:**
```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

## Test File Organization

**Recommended Location:**
- Co-locate tests next to source files
- Name pattern: `[filename].test.tsx` or `[filename].test.ts`

**Recommended Structure:**
```
components/
  resource-card.tsx
  resource-card.test.tsx
  filters.tsx
  filters.test.tsx
lib/
  queries.ts
  queries.test.ts
  utils.ts
  utils.test.ts
```

## What to Test (Priority Order)

### High Priority

**1. `lib/queries.ts` -- Data fetching functions**
- `getResources()`: filter combinations, empty results, error handling
- `getResourceBySlug()`: valid slug, missing slug (error throw)
- `getRelatedResources()`: exclusion logic, limit
- `getResourceCount()`: count return, null fallback
- Mock: Supabase client with chained query builder

**2. `lib/utils.ts` -- Utility functions**
- `cn()`: class merging behavior
- `hasEnvVars`: truthy/falsy based on env presence

**3. `components/resource-card.tsx` -- Core display component**
- Renders resource name, type badge, pillar badge, level
- Featured badge conditional rendering
- Free/Paid indicator
- Tag truncation (max 4 shown)
- Links to correct slug URL

**4. Client-side forms (`components/login-form.tsx`, `components/sign-up-form.tsx`)**
- Form submission flow
- Error display
- Loading state
- Password mismatch validation (sign-up)

### Medium Priority

**5. `components/filters.tsx` -- URL-driven filter component**
- Filter toggle updates URL params
- Active filter styling
- Clear all filters

**6. `components/search-bar.tsx` -- Search input**
- URL update on input change
- Pending state indicator

**7. `components/resource-grid.tsx` -- Grid layout logic**
- Featured section shows when no filters active
- Filtered results section shows count
- Empty state rendering

### Lower Priority

**8. `supabase/functions/sync-raindrop/index.ts` -- Edge function**
- Deno runtime; requires separate test setup
- Test `slugify()` as a pure function
- Integration test for classification pipeline (mock external APIs)

## Mocking Strategy

**Supabase Client Mock:**
```typescript
// Create a chainable mock for Supabase query builder
const mockSelect = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();
const mockNeq = vi.fn().mockReturnThis();
const mockOr = vi.fn().mockReturnThis();
const mockOrder = vi.fn().mockReturnThis();
const mockLimit = vi.fn().mockReturnThis();
const mockSingle = vi.fn();

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  eq: mockEq,
  neq: mockNeq,
  or: mockOr,
  order: mockOrder,
  limit: mockLimit,
  single: mockSingle,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve({ from: mockFrom })),
}));
```

**Next.js Navigation Mock:**
```typescript
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));
```

**What to Mock:**
- Supabase client (both server and browser variants)
- `next/navigation` hooks and functions (`useRouter`, `useSearchParams`, `redirect`, `notFound`)
- `next/headers` (`cookies`)
- External API calls (Raindrop, Anthropic) in edge function tests

**What NOT to Mock:**
- `cn()` utility -- pure function, test directly
- Component rendering -- use Testing Library to render and assert
- `slugify()` -- pure function, test directly
- React hooks behavior -- let Testing Library handle actual hook execution

## Fixtures

**Sample Resource fixture to create at `__tests__/fixtures/resource.ts`:**
```typescript
import type { Resource } from "@/lib/queries";

export const mockResource: Resource = {
  id: "test-uuid-1",
  slug: "test-resource",
  name: "Test Resource",
  url: "https://example.com",
  description: "A test resource description",
  type: "tool",
  pillar: "discovery",
  tags: ["testing", "example", "fixtures"],
  level: "beginner",
  author: "Test Author",
  expert_take: "This is a great resource for testing.",
  language: "en",
  is_free: true,
  is_featured: false,
  logo_url: null,
  raindrop_id: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

export const mockFeaturedResource: Resource = {
  ...mockResource,
  id: "test-uuid-2",
  slug: "featured-resource",
  name: "Featured Resource",
  is_featured: true,
};
```

**Location:** Create at `__tests__/fixtures/resource.ts` or co-locate as `lib/__tests__/fixtures.ts`

## Coverage

**Requirements:** None enforced (no tests exist)

**Recommended targets:**
- `lib/` -- 90%+ (pure logic, easy to test)
- `components/` -- 70%+ (rendering and interaction)
- `app/` -- 50%+ (page-level integration)

**View Coverage:**
```bash
npm run test:coverage
```

## Test Types

**Unit Tests:**
- Pure functions in `lib/utils.ts`, `lib/queries.ts`
- Component rendering with mocked dependencies
- Form validation logic

**Integration Tests:**
- Full page render with mocked Supabase responses
- Filter + search interaction flows
- Auth flow (login, sign-up, error states)

**E2E Tests:**
- Not set up; consider Playwright if needed for critical user flows
- Would cover: homepage load, filter interaction, resource detail navigation, auth flow

## Common Patterns

**Async Testing:**
```typescript
import { describe, it, expect, vi } from "vitest";

describe("getResources", () => {
  it("returns filtered resources", async () => {
    // Arrange: set up mock to resolve with test data
    mockOrder.mockResolvedValueOnce({ data: [mockResource], error: null });

    // Act
    const result = await getResources({ type: "tool" });

    // Assert
    expect(result).toHaveLength(1);
    expect(mockEq).toHaveBeenCalledWith("type", "tool");
  });
});
```

**Component Testing:**
```typescript
import { render, screen } from "@testing-library/react";
import { ResourceCard } from "@/components/resource-card";
import { mockResource } from "@/__tests__/fixtures/resource";

describe("ResourceCard", () => {
  it("renders resource name and type badge", () => {
    render(<ResourceCard resource={mockResource} />);

    expect(screen.getByText("Test Resource")).toBeInTheDocument();
    expect(screen.getByText("Tool")).toBeInTheDocument();
  });
});
```

**Error Testing:**
```typescript
it("throws when Supabase returns error", async () => {
  mockOrder.mockResolvedValueOnce({
    data: null,
    error: { message: "Not found" },
  });

  await expect(getResourceBySlug("missing")).rejects.toThrow();
});
```

---

*Testing analysis: 2026-03-12*
