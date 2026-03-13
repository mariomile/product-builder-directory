# Phase 4: Infrastructure and Deploy - Research

**Researched:** 2026-03-13
**Domain:** Supabase (migration, edge function, cron, MCP) + Vercel deployment
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Supabase project:** `miclgfzbdzjhdurdeqmt.supabase.co` — already exists, schema live, 20 resources seeded
- **Migration gap:** `003_rls_delete.sql` must be applied via `apply_migration` (was written in Phase 3, never executed against live DB)
- **Migration tracking:** Mark `002_seed` as tracked for consistency (data already in DB)
- **Vercel:** Create new project connected to `github.com/mariomile/product-builder-directory`, branch `main` for production
- **Vercel env vars required:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SYNC_SECRET` (server-side)
- **Edge function:** Deploy `supabase/functions/sync-raindrop/index.ts` to the Supabase project
- **Cron schedule:** Every 6 hours
- **Edge function secrets:** `RAINDROP_TOKEN`, `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SYNC_SECRET`
- **MCP:** Configure Supabase MCP against live DB — no canned demo scripts needed

### Claude's Discretion
- Exact Vercel project name
- Production URL (auto-assigned by Vercel unless custom domain added)
- Tracking `002_seed` migration: document as already applied rather than re-running

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFR-01 | Supabase project created with EU region, migrations executed, 20 resources seeded | Project exists at `miclgfzbdzjhdurdeqmt.supabase.co`; 001_init + 002_seed already applied; 003_rls_delete must be applied via Supabase MCP `apply_migration` |
| INFR-02 | Supabase MCP configured and tested with 5 demo queries | MCP tools already available (`apply_migration`, `deploy_edge_function`, `execute_sql`); configuration points to live project URL + service role key |
| INFR-03 | Raindrop sync edge function deployed with cron schedule | `supabase/functions/sync-raindrop/index.ts` is complete and ready; deploy via `deploy_edge_function` MCP tool; cron every 6 hours via Supabase dashboard pg_cron |
| INFR-04 | Application deployed to Vercel with production URL and correct env vars | Vercel CLI v50.4.11 available at `~/.local/bin/vercel`; GitHub remote `github.com/mariomile/product-builder-directory` confirmed; `vercel --prod` deploys from `main` |
</phase_requirements>

---

## Summary

Phase 4 is an operational deployment phase, not a code-change phase. The application code is complete after Phase 3. This phase's work is: (1) close the RLS security gap by applying migration 003, (2) deploy the sync edge function with cron, (3) connect Vercel to the GitHub repo and configure env vars, and (4) verify MCP works against the live database.

The key insight is that most of the "infrastructure" already exists: the Supabase project is live with schema and seed data, the edge function code is complete, `.env.local` has the client-side keys, and Vercel CLI v50.4.11 is installed. The work is almost entirely configuration and deployment commands, not new code.

The one critical ordering constraint: `003_rls_delete.sql` is a security policy that was written in Phase 3 but never executed against the live DB. It must be applied before the production URL goes live so the resources table never has an open DELETE window.

**Primary recommendation:** Execute in order — DB migration first (security closure), then edge function deploy, then Vercel project creation + env vars, then smoke test. Each step is a discrete, verifiable checkpoint.

---

## Standard Stack

### Core Infrastructure Tools

| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Supabase MCP | (via MCP server) | Apply migrations, deploy edge functions, execute SQL | Already configured in this project; `apply_migration`, `deploy_edge_function`, `execute_sql` tools available |
| Vercel CLI | 50.4.11 | Create project, set env vars, deploy | Already installed at `~/.local/bin/vercel`; supports `vercel link`, `vercel env add`, `vercel --prod` |
| Supabase Dashboard | web | Set edge function secrets, verify cron schedule | Only place to set Supabase secrets (not CLI for this project — no `supabase` CLI binary found) |

### Supabase MCP Tool Reference

The project has confirmed these MCP tools available (from CONTEXT.md and INTEGRATIONS.md):

| Tool | Usage |
|------|-------|
| `apply_migration` | Execute a SQL migration against the live Supabase project |
| `deploy_edge_function` | Deploy a Deno edge function to Supabase |
| `execute_sql` | Run arbitrary SQL for verification queries |

**Note:** The `supabase` CLI binary is NOT installed on this machine (`supabase not found`). All Supabase operations must go through the MCP tools or the Supabase Dashboard UI.

### Environment Variables Inventory

**Already in `.env.local` (copy to Vercel):**
```
NEXT_PUBLIC_SUPABASE_URL=https://miclgfzbdzjhdurdeqmt.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_DkR-o-xH96lnFBTqIy-rRw_kftRRaWr
```

**Must add to Vercel (server-side, for edge function invocation):**
```
SYNC_SECRET=<value from secrets store>
```

**Must add to Supabase Dashboard → Edge Functions → Secrets:**
```
RAINDROP_TOKEN=<raindrop bearer token>
ANTHROPIC_API_KEY=<anthropic key>
SUPABASE_URL=https://miclgfzbdzjhdurdeqmt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role key from Supabase dashboard>
SYNC_SECRET=<same value as Vercel SYNC_SECRET>
```

---

## Architecture Patterns

### Deployment Order (Critical)

The correct execution sequence prevents a window where the production URL is live before the security gap is closed:

```
1. Apply 003_rls_delete.sql → closes RLS DELETE gap
   ↓
2. Mark 002_seed as tracked → migration history consistent
   ↓
3. Deploy sync-raindrop edge function → function live
   ↓
4. Set edge function secrets via Dashboard → function operational
   ↓
5. Create Vercel project → link to GitHub repo
   ↓
6. Set Vercel env vars → app can connect to DB
   ↓
7. Trigger production deploy from main branch → URL live
   ↓
8. Smoke test + MCP verification queries
```

### Pattern 1: Applying a Migration via Supabase MCP

**What:** Executes a SQL file against the live project database
**When to use:** Closing the 003_rls_delete.sql security gap; marking 002_seed as tracked

The `apply_migration` MCP tool takes the SQL content and a migration name. For `003_rls_delete.sql`:
```sql
-- Source: supabase/migrations/003_rls_delete.sql
CREATE POLICY "Authenticated delete"
  ON resources FOR DELETE
  USING (auth.role() = 'authenticated');
```

For marking `002_seed` as already applied, the Supabase migration tracking table is `supabase_migrations.schema_migrations`. The approach is to INSERT a record into that table rather than re-running the seed INSERT statements (which would fail on unique constraint for slug). Use `execute_sql` to insert the tracking record.

### Pattern 2: Deploy Edge Function via Supabase MCP

**What:** Pushes `supabase/functions/sync-raindrop/index.ts` to the live project
**When to use:** INFR-03

The `deploy_edge_function` tool targets the function by directory name. After deploy, the cron schedule is configured in Supabase Dashboard → Edge Functions → (function name) → Schedule.

**Cron expression for every 6 hours:** `0 */6 * * *`

### Pattern 3: Vercel Project Setup via CLI

**What:** Create project, connect GitHub, add env vars, trigger production deploy
**Sequence:**
```bash
# In project directory
cd /Users/mariomiletta/conductor/workspaces/builder-directory/douala

# Link to Vercel (interactive — creates project, connects GitHub)
vercel link

# Add env vars (one at a time; prompts for value)
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production
vercel env add SYNC_SECRET production

# Deploy to production from main branch
vercel --prod
```

**Alternative (non-interactive):** `vercel link --yes` to skip prompts if already authenticated.

### Pattern 4: MCP Verification Queries

**What:** 5 SQL queries to prove the live DB is correct and queryable via MCP
**When to use:** INFR-02 verification

Representative queries to run via `execute_sql`:
```sql
-- 1. Total count
SELECT COUNT(*) FROM resources;

-- 2. Featured resources
SELECT name, type, pillar FROM resources WHERE is_featured = true ORDER BY name;

-- 3. Filter by pillar
SELECT name, type FROM resources WHERE pillar = 'stack' ORDER BY name;

-- 4. Full-text search (uses pg_trgm index)
SELECT name, type, pillar FROM resources
WHERE name ILIKE '%supabase%' OR description ILIKE '%supabase%';

-- 5. RLS policy verification
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'resources' ORDER BY policyname;
```

### Pattern 5: Smoke Test Checklist

After Vercel deploy, verify via browser:
1. Homepage loads with 20 resources visible
2. Search works (type a query, results filter)
3. Filter by type/pillar works
4. Pagination shows correctly (20 items/page)
5. Click a resource card → detail page loads

### Anti-Patterns to Avoid

- **Re-running 002_seed.sql:** The data is already in the DB. Running the INSERT again will fail with unique constraint violations on `slug`. Only insert the tracking record.
- **Deploying Vercel before DB migration:** Creates a public URL with the RLS DELETE gap. Always close security gaps before going live.
- **Setting secrets in `.env` files committed to git:** Supabase secrets go in Dashboard only; Next.js server-side secrets go in Vercel dashboard only.
- **Using anon key for edge functions:** The sync function uses `SUPABASE_SERVICE_ROLE_KEY`, not the publishable key. Service role bypasses RLS, which is intentional for the sync operation.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Migration tracking | Custom tracking table or scripts | Supabase MCP `apply_migration` (inserts into `supabase_migrations.schema_migrations`) | Supabase's native migration history; planner tools rely on it |
| Cron scheduling | External cron service or Vercel cron | Supabase Dashboard → Edge Functions → Schedule | Already supported natively; no extra infrastructure |
| Env var management | Shell scripts to export vars | `vercel env add` CLI or Vercel Dashboard | Vercel env system handles production/preview/development scoping |
| Production deploy | Manual file upload or SSH | `vercel --prod` | Git integration means every push to `main` auto-deploys after initial link |

---

## Common Pitfalls

### Pitfall 1: 002_seed Already Applied — Don't Re-Run

**What goes wrong:** Running `002_seed.sql` again triggers `ERROR: duplicate key value violates unique constraint "resources_slug_key"` for all 20 slugs.

**Why it happens:** The data is already in the DB from initial setup. The migration was never formally tracked, only executed manually.

**How to avoid:** Use `execute_sql` to insert a row into `supabase_migrations.schema_migrations` with name `20240101000002_seed` (or equivalent) rather than re-running the INSERT statements.

**Warning signs:** If you see 20 duplicate key errors during migration, you ran the seed again.

### Pitfall 2: Edge Function Secrets Not Set Before Testing

**What goes wrong:** Edge function deploys successfully but returns 401 or 500 on first invocation because `SYNC_SECRET`, `RAINDROP_TOKEN`, etc. are not yet configured.

**Why it happens:** Deploying a function and setting its secrets are separate steps in Supabase. Deploy pushes the code; secrets are set independently in Dashboard.

**How to avoid:** Set ALL required secrets in Dashboard before invoking the function. The function checks `SYNC_SECRET` before the try block — a missing secret returns 401, not 500.

**Required secrets checklist:**
- `SYNC_SECRET` ✓
- `RAINDROP_TOKEN` ✓
- `ANTHROPIC_API_KEY` ✓
- `SUPABASE_URL` ✓
- `SUPABASE_SERVICE_ROLE_KEY` ✓

### Pitfall 3: Vercel Build Fails on Missing Env Vars

**What goes wrong:** Vercel build succeeds but the deployed app crashes at runtime because `instrumentation.ts` validates env vars at startup and throws for missing values.

**Why it happens:** `instrumentation.ts` (Phase 3) validates `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` at startup. If Vercel env vars are not set before the first deploy, the deployed app will fail health checks.

**How to avoid:** Set all env vars (`vercel env add`) before running `vercel --prod`. Verify with `vercel env ls` that all three are present for production environment.

### Pitfall 4: Vercel CLI Not Logged In

**What goes wrong:** `vercel link` or `vercel --prod` fails with authentication error.

**Why it happens:** Vercel CLI requires authentication to the user's Vercel account.

**How to avoid:** Run `vercel whoami` first. If not authenticated, run `vercel login` before other commands.

### Pitfall 5: SYNC_SECRET Mismatch Between Vercel and Supabase

**What goes wrong:** If `SYNC_SECRET` differs between Vercel env and Supabase edge function secrets, any Vercel-triggered invocations of the edge function will get 401.

**Why it happens:** The secret must match exactly in both places. Setting it twice manually creates a copy risk.

**How to avoid:** Generate one SYNC_SECRET value, then set it in both Vercel env vars AND Supabase edge function secrets. Document the value in a secure local note before distributing.

---

## Code Examples

### Migration Tracking for Already-Applied Seed

```sql
-- Source: Supabase migration history pattern
-- Insert tracking record without re-running seed data
-- Run via execute_sql MCP tool
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES (
  '20240101000002',
  'seed',
  ARRAY['-- Seed data applied manually; tracked retroactively']
)
ON CONFLICT (version) DO NOTHING;
```

**Note:** The exact table name and schema for Supabase migration tracking should be confirmed via `execute_sql` running `SELECT * FROM supabase_migrations.schema_migrations LIMIT 5` before inserting.

### Vercel Env Var Setup Sequence

```bash
# Verify authentication
vercel whoami

# Link project (run from repo root)
vercel link

# Add all required env vars for production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production
vercel env add SYNC_SECRET production

# Verify all vars are set
vercel env ls production

# Deploy to production
vercel --prod
```

### Cron Authorization Header Pattern

The edge function requires `Authorization: Bearer <SYNC_SECRET>`. When Supabase runs the cron, it must pass this header. In Supabase Dashboard → Edge Functions → Schedule, the cron invocation includes header configuration. Confirm the cron payload includes:
```json
{
  "headers": {
    "Authorization": "Bearer <SYNC_SECRET value>"
  }
}
```

### MCP Verification — RLS Policy Check

```sql
-- Confirm all 4 RLS policies are present (3 from 001_init, 1 from 003_rls_delete)
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'resources'
ORDER BY cmd;
-- Expected: Public read access (SELECT), Authenticated insert (INSERT),
--           Authenticated update (UPDATE), Authenticated delete (DELETE)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Supabase CLI for migrations | Supabase MCP `apply_migration` | MCP tooling available in this project | No CLI binary needed; works via conversation |
| Manual Vercel deploy | `vercel --prod` + GitHub integration | Vercel v2+ | Push to main auto-deploys after initial link |
| Separate cron service (e.g., cron-job.org) | Supabase native cron schedule | Supabase edge function scheduling | No external dependency for cron |

---

## Open Questions

1. **Supabase migration tracking table name**
   - What we know: Supabase uses an internal table to track applied migrations
   - What's unclear: The exact schema/table name (`supabase_migrations.schema_migrations` vs `_supabase_migrations.schema_migrations`) and exact column names vary by Supabase version
   - Recommendation: Run `execute_sql` with `SELECT * FROM information_schema.tables WHERE table_schema LIKE '%migration%'` to confirm before inserting the 002_seed tracking record. If the table doesn't exist or isn't writable, document 002_seed as "applied manually" in a code comment and skip the tracking insert.

2. **Supabase cron header configuration**
   - What we know: Supabase edge function scheduled invocations need to pass the `SYNC_SECRET` authorization header
   - What's unclear: Whether Supabase's native cron UI supports custom headers, or whether the cron must be configured via pg_cron SQL
   - Recommendation: Check the Supabase Dashboard cron UI when deploying. If headers aren't configurable, use pg_cron via `execute_sql` to schedule an `http_request` extension call with the header set.

3. **SYNC_SECRET value source**
   - What we know: The secret must be set in both Vercel and Supabase
   - What's unclear: Whether a SYNC_SECRET was already generated and stored somewhere, or needs to be created fresh
   - Recommendation: Generate a new one (`openssl rand -hex 32`) during this phase if not already documented.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — no test framework installed |
| Config file | None — Wave 0 gap |
| Quick run command | Manual smoke test via browser |
| Full suite command | N/A |

**Note:** This phase is operational (deploy, configure, verify) rather than code changes. The "tests" for this phase are manual smoke tests and MCP verification queries, not automated test suite runs. The project has no test framework (confirmed in TESTING.md). Installing one is out of scope for this infrastructure phase.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFR-01 | 20 resources in live DB, migrations applied | Manual SQL query | `execute_sql: SELECT COUNT(*) FROM resources` | ❌ Wave 0 (manual only) |
| INFR-02 | 5 MCP queries return correct results | Manual MCP invocation | 5 SQL queries via `execute_sql` | ❌ Wave 0 (manual only) |
| INFR-03 | Edge function deployed and cron active | Manual invocation test | POST to edge function URL with SYNC_SECRET | ❌ Wave 0 (manual only) |
| INFR-04 | Vercel URL loads, env vars correct, smoke test passes | Manual browser test | `vercel --prod` + browser navigation | ❌ Wave 0 (manual only) |

### Sampling Rate

- **Per task commit:** Run manual smoke test (browser load of production URL)
- **Per wave merge:** Full 5-query MCP verification + edge function manual trigger
- **Phase gate:** All 4 INFR requirements manually verified before `/gsd:verify-work`

### Wave 0 Gaps

There are no automated test files to create — this phase uses manual verification exclusively. The verification steps are embedded in the plan tasks as acceptance criteria.

*(No automated test infrastructure gaps to fill for this phase.)*

---

## Sources

### Primary (HIGH confidence)

- `.planning/phases/04-infrastructure-and-deploy/04-CONTEXT.md` — locked decisions, known assets, Supabase project ID
- `supabase/functions/sync-raindrop/index.ts` — edge function code, required secrets, authorization pattern
- `supabase/migrations/001_init.sql` — schema, RLS policies, confirms what's already applied
- `supabase/migrations/003_rls_delete.sql` — exact SQL of the pending migration
- `.env.local` — confirmed env vars already available
- `.planning/codebase/INTEGRATIONS.md` — confirmed MCP tools, env var inventory
- `package.json` — confirmed `next 16.1.6`, no test framework
- `vercel --version` output — confirmed Vercel CLI v50.4.11 installed
- `git remote -v` output — confirmed GitHub repo `github.com/mariomile/product-builder-directory`

### Secondary (MEDIUM confidence)

- `.planning/codebase/TESTING.md` — confirms no test framework, explains why this phase uses manual verification
- `.planning/codebase/STACK.md` — stack inventory, Vercel deployment target confirmed

### Tertiary (LOW confidence — mark for validation)

- Supabase migration tracking table schema: `supabase_migrations.schema_migrations` — needs runtime confirmation via `execute_sql`
- Supabase cron header support: whether Dashboard cron UI supports Authorization headers — needs Dashboard inspection at deploy time

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Vercel CLI version verified, Supabase MCP tools confirmed from CONTEXT.md, no supabase CLI binary confirmed via which
- Architecture: HIGH — deployment order derived from security requirements and confirmed existing assets
- Pitfalls: HIGH — most are derived from reading the actual code (instrumentation.ts startup validation, edge function auth-before-try pattern, seed SQL with unique constraints)
- Migration tracking: MEDIUM — table name needs runtime confirmation

**Research date:** 2026-03-13
**Valid until:** 2026-03-20 (7 days — Vercel and Supabase Dashboard UIs change frequently)
