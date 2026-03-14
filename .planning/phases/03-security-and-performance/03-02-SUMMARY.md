---
phase: 03-security-and-performance
plan: 02
subsystem: ui
tags: [nextjs, supabase, pagination, debounce, url-state]

# Dependency graph
requires:
  - phase: 03-01
    provides: sanitizeSearch in lib/queries.ts used by getResources()
provides:
  - Offset-based pagination (PAGE_SIZE=20) in getResources() with count:exact
  - PaginationBar client component with prev/next URL navigation
  - filteredCount displayed in ResourceGrid
  - 300ms debounced SearchBar that resets page param
  - Filter page-reset on any FilterGroup selection change
affects:
  - 03-03
  - 04-sync-pipeline

# Tech tracking
tech-stack:
  added: []
  patterns:
    - URL-driven pagination via page search param, preserved alongside filter params
    - Debounce pattern using useRef<ReturnType<typeof setTimeout>> to avoid stale closures
    - Page-reset-on-filter: all navigation handlers delete 'page' param before pushing

key-files:
  created:
    - components/pagination-bar.tsx
  modified:
    - lib/queries.ts
    - components/resource-grid.tsx
    - components/search-bar.tsx
    - components/filters.tsx
    - app/page.tsx

key-decisions:
  - "PaginationBar hides itself when totalPages <= 1 (no pagination for small datasets)"
  - "page=1 omitted from URL (params.delete instead of params.set('page','1')) for clean URLs"
  - "filteredCount replaces getResourceCount() in ResourceGrid — ResourceGrid now shows search-scoped count, not total"
  - "hasFilters check excludes 'page' key to avoid treating page=2 as an active filter"

patterns-established:
  - "Page reset pattern: all router.push handlers call params.delete('page') before navigating"
  - "Debounce via useRef: debounceRef.current = setTimeout(..., 300) — cancels previous timer on each keystroke"

requirements-completed: [PERF-01, PERF-02, STAB-01]

# Metrics
duration: 7min
completed: 2026-03-13
---

# Phase 3 Plan 02: Pagination, Debounce, and Filter Reset Summary

**Offset-based pagination (20/page) with filteredCount display, 300ms debounced search, and page-reset on all filter changes — all driven by URL search params**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-13T13:57:10Z
- **Completed:** 2026-03-13T14:04:19Z
- **Tasks:** 2
- **Files modified:** 6 (5 modified + 1 created)

## Accomplishments
- getResources() now uses count:exact and .range() for offset pagination, returning {data, filteredCount, totalPages, currentPage}
- PaginationBar component created with prev/next buttons, page/totalPages indicator, and clean URL navigation (page=1 omitted)
- SearchBar debounced to 300ms using useRef, preventing router.push on every keystroke; also resets page param
- FilterGroup.handleFilter now calls params.delete("page") before any filter change, eliminating stale-page false-negatives
- ResourceGrid shows filteredCount (scoped to current filters) instead of total unfiltered count

## Task Commits

Each task was committed atomically:

1. **Task 1: Add pagination to getResources() and create PaginationBar** - `448bce8` (feat)
2. **Task 2: Update ResourceGrid, debounce SearchBar, reset page in FilterGroup** - `07bea50` (feat)

## Files Created/Modified
- `lib/queries.ts` - Added PAGE_SIZE=20, page param, count:exact, .range(), new return type
- `components/pagination-bar.tsx` - New client component: prev/next navigation, hides at totalPages<=1
- `components/resource-grid.tsx` - Uses new getResources() shape, shows filteredCount, renders PaginationBar
- `components/search-bar.tsx` - Added debounceRef 300ms debounce, page param reset on search
- `components/filters.tsx` - Added params.delete("page") in FilterGroup.handleFilter
- `app/page.tsx` - Added page? field to SearchParams type

## Decisions Made
- PaginationBar hides itself when totalPages <= 1 (return null) — no pagination chrome for small datasets
- page=1 omitted from URL (params.delete rather than params.set('page','1')) — clean canonical URLs
- filteredCount replaces getResourceCount() in ResourceGrid — count is now search/filter-scoped, not total
- hasFilters excludes the 'page' key from the check to avoid treating paginated browsing as an active filter state

## Deviations from Plan

None — plan executed exactly as written. The build TypeScript check passed cleanly. The pre-existing ESLint circular-JSON error (ESLint 9 + legacy eslintrc config incompatibility) is out of scope for this plan.

## Issues Encountered
- Build failed mid-execution after Task 1 changes because resource-grid.tsx still referenced the old Resource[] return type from getResources(). This is expected plan sequencing — both task files had to be updated before build could pass. Both tasks were committed after the combined build verified successfully.

## Next Phase Readiness
- Pagination, debounce, and filter-reset are complete; app is ready for Phase 3 Plan 03 (performance/caching) or Phase 4 (sync pipeline)
- getResourceCount() export is still available for any future use (nav stat, total counter in hero, etc.)
- No blockers

---
*Phase: 03-security-and-performance*
*Completed: 2026-03-13*
