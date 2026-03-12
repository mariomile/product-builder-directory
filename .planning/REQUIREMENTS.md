# Requirements: Product Builder Directory

**Defined:** 2026-03-12
**Core Value:** Users can quickly find the right tool or resource for their product building workflow, filtered by need, with expert takes that explain why.

## v1 Requirements

### Stability

- [ ] **STAB-01**: Search input debounces 300ms before triggering server navigation
- [ ] **STAB-02**: Error boundaries (error.tsx) exist at app/ and app/resources/[slug]/ with terminal-styled fallback
- [ ] **STAB-03**: All dependencies pinned to exact versions (no "latest")
- [ ] **STAB-04**: AI classification JSON from Claude is validated against expected schema before database insert
- [ ] **STAB-05**: Unused Supabase auth template boilerplate removed (auth pages, protected routes, theme switcher)

### Design

- [ ] **DSGN-01**: CSS variables redefined for terminal palette (black/white/cyan, --radius: 0rem)
- [ ] **DSGN-02**: Geist Mono font applied globally via layout.tsx and tailwind.config.ts
- [ ] **DSGN-03**: Dark mode forced as default, theme switcher removed
- [ ] **DSGN-04**: Resource cards restyled as monochrome terminal listings (no rainbow badge colors)
- [ ] **DSGN-05**: Search bar, filters, and detail page restyled with terminal aesthetic
- [ ] **DSGN-06**: Loading skeletons with terminal character replace text-only loading states
- [ ] **DSGN-07**: Cmd+K keyboard shortcut focuses search input

### Performance

- [ ] **PERF-01**: Resources paginated at 20 items per page with cursor-based navigation
- [ ] **PERF-02**: Filtered result count displayed to user (not just total count)

### Security

- [ ] **SECR-01**: Search query sanitized to prevent PostgREST filter injection
- [ ] **SECR-02**: RLS DELETE policy added to resources table
- [ ] **SECR-03**: Raindrop sync edge function requires authorization header
- [ ] **SECR-04**: Required environment variables validated at startup with clear error messages

### Infrastructure

- [ ] **INFR-01**: Supabase project created with EU region, migrations executed, 20 resources seeded
- [ ] **INFR-02**: Supabase MCP configured and tested with 5 demo queries
- [ ] **INFR-03**: Raindrop sync edge function deployed with cron schedule
- [ ] **INFR-04**: Application deployed to Vercel with production URL and correct env vars

### Code Quality

- [ ] **QUAL-01**: Label maps (typeLabels, pillarLabels, typeColors) extracted to shared lib/constants.ts
- [ ] **QUAL-02**: Radix UI package conflicts resolved (meta-package vs individual packages)

## v2 Requirements

### UX Polish

- **UXP-01**: j/k keyboard navigation through resource cards
- **UXP-02**: "Newly added" badge for resources created in last 14 days
- **UXP-03**: Empty state with suggestions when zero results
- **UXP-04**: Accessible filter controls with ARIA roles and keyboard handlers
- **UXP-05**: Back navigation preserves filter state

### Content

- **CONT-01**: Expand to 50+ curated resources
- **CONT-02**: Pillar-based landing pages

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / authentication | No value for a public browse-only directory |
| User ratings / comments / upvotes | Undermines "curated by experts" positioning |
| AI-powered personalized recommendations | Overkill for 20-200 resources |
| Newsletter / email capture | Not the product's job |
| Sponsored / promoted listings | Destroys trust in curation |
| Complex sort controls | Curation IS the sort order |
| Resource submission form | Keeps ingestion controlled via Raindrop |
| Dark mode toggle | Terminal aesthetic forces dark mode |
| About / Blog pages | Not needed for MVP |
| Mobile app | Web-first |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| STAB-01 | Phase 3 | Pending |
| STAB-02 | Phase 2 | Pending |
| STAB-03 | Phase 1 | Pending |
| STAB-04 | Phase 2 | Pending |
| STAB-05 | Phase 1 | Pending |
| DSGN-01 | Phase 2 | Pending |
| DSGN-02 | Phase 2 | Pending |
| DSGN-03 | Phase 2 | Pending |
| DSGN-04 | Phase 2 | Pending |
| DSGN-05 | Phase 2 | Pending |
| DSGN-06 | Phase 2 | Pending |
| DSGN-07 | Phase 2 | Pending |
| PERF-01 | Phase 3 | Pending |
| PERF-02 | Phase 3 | Pending |
| SECR-01 | Phase 3 | Pending |
| SECR-02 | Phase 3 | Pending |
| SECR-03 | Phase 3 | Pending |
| SECR-04 | Phase 3 | Pending |
| INFR-01 | Phase 4 | Pending |
| INFR-02 | Phase 4 | Pending |
| INFR-03 | Phase 4 | Pending |
| INFR-04 | Phase 4 | Pending |
| QUAL-01 | Phase 2 | Pending |
| QUAL-02 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0

---
*Requirements defined: 2026-03-12*
*Last updated: 2026-03-12 after roadmap creation*
