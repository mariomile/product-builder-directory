# Feature Landscape

**Domain:** Curated resource directory for product builders
**Researched:** 2026-03-12

## Current State

The directory MVP already includes: full-text search (URL-driven), single-select filters (type, pillar, level, price), resource cards with expert take previews, featured resources section, detail pages with related resources, dynamic SEO metadata, dark mode, and a Raindrop.io + Claude AI ingestion pipeline.

Key gaps identified: no search debounce, no pagination, text-only loading states, no error boundaries, no result counts per filter, no keyboard accessibility.

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Status | Notes |
|---------|--------------|------------|--------|-------|
| Search with debounce | Every keystroke triggers server navigation without debounce -- feels broken on slow connections | Low | MISSING | Add 300ms debounce to SearchBar onChange handler |
| Pagination or infinite scroll | Currently fetches ALL resources in one query -- breaks at scale, slow initial load | Medium | MISSING | Cursor-based pagination preferred for Supabase; 20-30 items per page |
| Loading skeletons | Text-only "Loading resources..." gives no spatial preview of incoming content | Low | MISSING | Skeleton cards matching ResourceCard dimensions |
| Error boundaries | No error.tsx files anywhere -- unhandled errors show raw Next.js error page | Low | MISSING | Add error.tsx to app/ and app/resources/[slug]/ |
| Empty state with guidance | Current empty state is minimal -- no suggestions for broadening search | Low | PARTIAL | Show "Try removing filters" or suggest popular categories when zero results |
| Result count display | Users need to know how many resources match current filters | Low | PARTIAL | getResourceCount exists but only shows total, not filtered count |
| Mobile-responsive grid | Cards must stack cleanly on mobile with touch-friendly filter targets | Low | EXISTS | Grid already responsive; filter badges could be larger on mobile |
| Resource detail with context | Detail page must give enough info to decide whether to click through to external resource | Low | EXISTS | Expert take, description, tags, badges all present |
| Related resources | Users expect "more like this" to continue browsing without hitting back | Low | EXISTS | Shows 4 resources from same pillar |
| Back navigation | Users must easily return to the directory from detail pages | Low | EXISTS | Back link present but does not preserve filter state |
| SEO metadata per resource | Each resource page needs unique title and description for search engines | Low | EXISTS | generateMetadata implemented on detail page |
| Fast page loads (<2.5s) | Directories that load slowly lose visitors before content renders; 2.5s is the threshold | Medium | UNKNOWN | Needs measurement post-deploy; pagination will help significantly |
| Clear active filter indication | Users must see at a glance which filters are active and how to remove them | Low | EXISTS | Active badges use "default" variant; "Clear all" button shown when filters active |
| Accessible filter controls | Filters must be keyboard-navigable and screen-reader friendly | Low | MISSING | Badge-based filters lack proper ARIA roles and keyboard event handlers |

## Differentiators

Features that set the product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Terminal-style command aesthetic | Authentic to the developer/builder audience; visually distinctive from generic shadcn directories | Medium | Planned for this milestone -- monospace fonts, command-line metaphors, muted palette with accent highlights |
| Keyboard shortcut: Cmd+K search | Power users expect Cmd+K; fits terminal metaphor perfectly and signals "this was built by someone who gets it" | Low | Lightweight implementation -- focus the search input on Cmd+K, no full command palette needed |
| Keyboard navigation: j/k | Vim-style navigation through resource cards reinforces terminal identity for the power-user audience | Medium | Requires focus management across card grid; needs visible focus ring on active card |
| Expert takes as primary content | Most directories are link dumps; opinionated expert curation is the actual product and reason users return | Low | Already exists -- ensure it stays prominent and visually elevated in terminal redesign |
| AI-enriched metadata | Claude classifies type, pillar, level, and writes expert takes automatically from bookmarks | Low | Already built via Raindrop sync edge function; unique pipeline most directories lack |
| Shareable filter URLs | Every filter combination is a unique URL users can share, bookmark, or embed | Low | Already works via URL search params -- zero additional effort needed |
| "Newly added" indicator | Shows directory is alive and actively curated; builds trust that resources are current | Low | Add "New" badge for resources with created_at within last 14 days |
| Pillar-based information architecture | Organizing by product discipline (Discovery, Design, Delivery, Strategy, Stack, Meta-skill) is more useful than generic type categories | Low | Already the core taxonomy -- lean into it in navigation and hero section |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| User accounts and authentication | Adds friction to a browse-only directory; auth scaffolding exists from Supabase starter but activating it adds complexity with no value for readers | Keep directory fully public; remove or hide auth routes to reduce attack surface |
| User ratings, comments, or upvotes | Undermines the "curated by experts" positioning; requires moderation infrastructure and invites spam | Expert takes ARE the rating -- that is the product's differentiator |
| AI-powered personalized recommendations | Overkill for a directory of 20-200 resources; adds latency, complexity, and privacy concerns | Related resources by pillar is sufficient discovery; let curation do the work |
| Newsletter signup or email capture | Not the product's job; distracts from the directory purpose and requires GDPR/email compliance | Link to curator's LinkedIn if audience-building is desired |
| Sponsored or promoted listings | Destroys trust in curation quality immediately; audience will notice and leave | If monetization needed later, consider transparent affiliate links with disclosure |
| Complex sort controls | Curation IS the sort order; adding sort-by-date or sort-by-name implies the curator's ordering is not the best one | Keep featured resources pinned at top; otherwise show curator's intended order |
| Resource submission form | Opens the door to spam and low-quality submissions; shifts curator's work to moderation | Keep Raindrop.io as the single ingestion point controlled entirely by the curator |

## Feature Dependencies

```
Search debounce ──> Keyboard shortcuts
  (debounce fixes the navigation storm before adding more input triggers)

Pagination ──> Loading skeletons
  (skeletons need to match paginated card count, not unknown full dataset)

Error boundaries ──> (independent -- do first, catches all downstream failures)

Terminal design ──> Keyboard shortcuts
  (design establishes the visual language that shortcuts reinforce)

Terminal design ──> "Newly added" indicator
  (visual treatment of the badge depends on the new design system)

Pagination ──> Result count display
  (filtered count query pairs naturally with paginated data fetch)
```

## MVP Recommendation

Given the March 17 webinar deadline, prioritize ruthlessly.

**Must ship (critical for launch quality):**
1. **Search debounce** -- Low complexity, fixes a real UX bug that is noticeable during any demo
2. **Pagination** -- Medium complexity, required for performance; without it the app slows visibly as resources grow
3. **Error boundaries** -- Low complexity, prevents embarrassing unhandled crashes during live demo
4. **Loading skeletons** -- Low complexity, makes the app feel polished and intentional
5. **Terminal-style design overhaul** -- Medium complexity, this IS the milestone's identity and launch hook

**Should ship (high impact, low effort):**
6. **Cmd+K keyboard shortcut** -- Low complexity, instant "this feels like a real tool" moment during demo
7. **"Newly added" indicator** -- Low complexity, shows the directory is alive and actively maintained
8. **Empty state with filter suggestions** -- Low complexity, prevents dead-end browsing during exploration

**Defer to next milestone:**
- j/k keyboard navigation -- Medium complexity, needs focus management and visible focus states
- Result counts per filter option -- Medium complexity, requires additional Supabase queries per filter value
- Accessible ARIA roles on filters -- Low complexity but not blocking launch; address in accessibility pass
- Pillar landing pages -- Medium complexity, useful for SEO but not for webinar demo flow
- Back navigation preserving filter state -- Low complexity but edge-case UX improvement

## Sources

- Algolia: Search Filter UX Best Practices (https://www.algolia.com/blog/ux/search-filter-ux-best-practices)
- Nielsen Norman Group: Helpful Filter Categories and Values (https://www.nngroup.com/articles/filter-categories-values/)
- Pencil & Paper: Filter UX Design Patterns (https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-filtering)
- Jasmine Directory: Directory Strategy for 2026 (https://www.jasminedirectory.com/blog/your-directory-strategy-for-2026/)
- Whalesync: 10 Best Directory Websites 2025 (https://www.whalesync.com/blog/10-best-directory-websites-in-2025)
- DesignMonks: Search UX Best Practices 2026 (https://www.designmonks.co/blog/search-ux-best-practices)
- BricxLabs: 15 Filter UI Patterns 2025 (https://bricxlabs.com/blogs/universal-search-and-filters-ui)
- Codebase analysis: filters.tsx, search-bar.tsx, resource-card.tsx, page.tsx, resources/[slug]/page.tsx
