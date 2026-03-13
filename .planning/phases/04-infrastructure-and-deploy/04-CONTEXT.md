# Phase 4: Infrastructure and Deploy - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Stand up production infrastructure: apply missing DB migration, deploy the Raindrop sync edge function with its cron schedule, create and configure the Vercel project connected to the GitHub repo, and ship a working production URL. MCP should be functional but no canned demo scripts.

</domain>

<decisions>
## Implementation Decisions

### Supabase project
- Project already exists: `miclgfzbdzjhdurdeqmt.supabase.co`
- Schema is live, 20 resources are seeded
- The RLS DELETE policy (`003_rls_delete.sql`) must be applied via `apply_migration` — it was created in Phase 3 but never executed against the live DB
- Mark `002_seed` as a tracked migration for consistency (data is already in DB, migration just needs tracking)

### Vercel deployment
- Create a new Vercel project connected to GitHub repo: `github.com/mariomile/product-builder-directory`
- Branch: `main` for production deployments
- Required env vars in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - Any server-side keys for edge functions (SYNC_SECRET, etc.)

### Raindrop sync edge function
- Deploy `supabase/functions/sync-raindrop/index.ts` to the Supabase project
- Set cron schedule: every 6 hours (matches existing comments in function)
- Required secrets to configure in Supabase dashboard:
  - `RAINDROP_TOKEN`
  - `ANTHROPIC_API_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SYNC_SECRET`

### MCP configuration
- Configure Supabase MCP so it works against the live DB
- No canned demo queries needed — real product, not demo prep

### Claude's Discretion
- Exact Vercel project name
- Production URL (auto-assigned by Vercel unless custom domain added)
- Tracking `002_seed` migration: document as already applied rather than re-running

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `supabase/migrations/001_init.sql`: already applied ✅
- `supabase/migrations/002_seed.sql`: data in DB but migration not tracked as version
- `supabase/migrations/003_rls_delete.sql`: written in Phase 3, must be applied to live DB
- `supabase/functions/sync-raindrop/index.ts`: complete, ready to deploy
- `.env.local`: has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — copy to Vercel env vars

### Established Patterns
- Supabase MCP tools available: `apply_migration`, `deploy_edge_function`, `execute_sql`

### Integration Points
- Vercel connects to `github.com/mariomile/product-builder-directory` via GitHub integration
- Edge function needs `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (server-side, not the client publishable key)

</code_context>

<specifics>
## Specific Ideas

- User explicitly said: "build the real product" — no canned MCP query scripts needed
- User wants Vercel project created and connected to GitHub, not just a one-off deploy command
- RLS DELETE policy is a security gap that must close before production (Phase 3 wrote the SQL but it was never executed against the live DB)

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-infrastructure-and-deploy*
*Context gathered: 2026-03-13*
