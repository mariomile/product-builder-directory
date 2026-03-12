# Product Builder Directory — Setup Checklist

Step-by-step per portare il progetto da zero a live.

---

## Phase 1: Project Setup (DONE)

- [x] Scaffold con `npx create-next-app@latest -e with-supabase product-builder-directory`
  - Template: [with-supabase](https://github.com/vercel/next.js/tree/canary/examples/with-supabase)
  - Include: auth flow, middleware sessioni, client Supabase (browser + server), shadcn/ui base
- [x] Installare componenti shadcn/ui aggiuntivi (badge, card, input, button già inclusi)
- [x] Scrivere SPEC.md per GSD

## Phase 2: Database (TODO)

- [ ] **Creare progetto Supabase** su [supabase.com/dashboard](https://supabase.com/dashboard)
  - Region: EU (Frankfurt) — più vicino all'Italia
  - Salvare: Project URL, anon key, service role key
- [ ] **Creare `.env.local`** nella root del progetto:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJI...
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...
  ```
  ⚠️ Il template usa `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (non `ANON_KEY`)
- [ ] **Eseguire migration schema** — copia il contenuto di `supabase/migrations/001_init.sql` nel SQL Editor di Supabase Dashboard → Run
  - Crea: extension pg_trgm, enums (resource_type, resource_pillar, resource_level), tabella resources, indexes, trigger updated_at, RLS policies
- [ ] **Eseguire seed data** — copia `supabase/migrations/002_seed.sql` nel SQL Editor → Run
  - Inserisce 20 risorse reali (tool, corsi, articoli, newsletter, libri, community, x-post)
- [ ] **Verificare** — nel SQL Editor: `SELECT count(*), type FROM resources GROUP BY type;`

## Phase 3: Test Locale (TODO)

- [ ] `npm run dev` — verificare homepage su localhost:3000
- [ ] Testare search (digitare "Claude" nella barra)
- [ ] Testare filtri (cliccare su "Tool", poi "Delivery")
- [ ] Testare combinazione filtri + search
- [ ] Testare pagina dettaglio (cliccare su una card)
- [ ] Testare "Back to directory" e tag cliccabili

## Phase 4: Supabase MCP (TODO)

- [ ] **Aggiornare `.mcp.json`** con URL e service role key reali:
  ```json
  {
    "mcpServers": {
      "supabase": {
        "command": "npx",
        "args": [
          "-y",
          "@supabase/mcp-server-supabase@latest",
          "--supabase-url",
          "https://REAL_PROJECT_ID.supabase.co",
          "--supabase-service-role-key",
          "REAL_SERVICE_ROLE_KEY"
        ]
      }
    }
  }
  ```
- [ ] **Testare MCP** — aprire Claude Code nella directory del progetto, chiedere:
  1. "Mostrami tutti i tool ordinati per categoria"
  2. "Quale tool mi consigli per deployare un'app Next.js?"
  3. "Quanti tool abbiamo per categoria? Fai un riepilogo"
  4. "Aggiungi Linear come tool di produttività, url linear.app"
  5. "Rimuovi il tool che abbiamo appena aggiunto"

## Phase 5: Raindrop Sync (TODO)

- [ ] **Ottenere Raindrop API token** — [raindrop.io/settings#apps](https://app.raindrop.io/settings/integrations) → Create Test Token
- [ ] **Configurare secrets** in Supabase Dashboard → Edge Functions → Secrets:
  - `RAINDROP_TOKEN` — il token API di Raindrop
  - `ANTHROPIC_API_KEY` — la chiave API di Anthropic (per Claude Haiku enrichment)
  - `SUPABASE_URL` — URL del progetto
  - `SUPABASE_SERVICE_ROLE_KEY` — service role key
- [ ] **Deploy Edge Function**:
  ```bash
  supabase functions deploy sync-raindrop --project-ref YOUR_PROJECT_REF
  ```
- [ ] **Testare manualmente**:
  1. Salvare un bookmark su Raindrop con tag `#builder-dir`
  2. Invocare: `supabase functions invoke sync-raindrop --project-ref YOUR_PROJECT_REF`
  3. Verificare che la risorsa appaia nel DB con expert_take generato da AI
- [ ] **Configurare cron** (opzionale per MVP, utile per produzione):
  - Supabase Dashboard → Database → Extensions → pg_cron
  - Oppure via pg_cron SQL:
    ```sql
    SELECT cron.schedule(
      'sync-raindrop-every-6h',
      '0 */6 * * *',
      $$SELECT net.http_post(
        url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/sync-raindrop',
        headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
      );$$
    );
    ```

## Phase 6: Deploy su Vercel (TODO)

- [ ] **Push su GitHub**:
  ```bash
  gh repo create product-builder-directory --public --source=. --push
  ```
  (oppure crea repo manuale e `git remote add origin ...`)
- [ ] **Collegare a Vercel**:
  - [vercel.com/new](https://vercel.com/new) → Import da GitHub
  - Framework: Next.js (auto-detected)
- [ ] **Configurare env vars su Vercel**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - (NO service role key sul frontend — è solo per edge functions)
- [ ] **Deploy** — automatico al push, o `npx vercel --prod`
- [ ] **Verificare URL produzione** — tutto funziona come in locale

## Phase 7: Pre-Webinar (17 marzo)

- [ ] Avere almeno 20 risorse nel DB
- [ ] Testare Raindrop sync end-to-end (salva → sync → appare)
- [ ] Testare MCP queries (5 query scriptate)
- [ ] Preparare branch `demo-backup` con progetto GSD inizializzato
- [ ] Preparare branch `demo-v2` con 50% buildato + deploy Vercel
- [ ] Dry run completo del flow webinar

---

## Riferimenti

| Cosa | Dove |
|------|------|
| Template usato | `npx create-next-app@latest -e with-supabase` |
| Stack | Next.js 16 + Supabase + Vercel + shadcn/ui + Tailwind v3 |
| Spec prodotto | `SPEC.md` nella root |
| Schema DB | `supabase/migrations/001_init.sql` |
| Seed data | `supabase/migrations/002_seed.sql` |
| Raindrop sync | `supabase/functions/sync-raindrop/index.ts` |
| MCP config | `.mcp.json` (gitignored) |
| Webinar doc | Craft → "Product Heroes - Webinar #3 | 17 Mar 2026" |
