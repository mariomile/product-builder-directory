# Product Builder Directory — Next Steps

Stato attuale: progetto scaffoldato, codice scritto, build OK. Manca DB e deploy.

---

## DA FARE (in ordine)

### 1. Creare progetto Supabase via MCP

Connetti Supabase MCP e usa i tool per:

```
1. Crea un nuovo progetto Supabase (region EU - Frankfurt)
2. Salva le credenziali in .env.local:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
   - SUPABASE_SERVICE_ROLE_KEY
3. Aggiorna .mcp.json con URL e service role key reali
```

### 2. Eseguire migrations via MCP

Esegui i due file SQL tramite Supabase MCP (SQL Editor):

```
1. Esegui supabase/migrations/001_init.sql → crea tabella, enums, indexes, RLS
2. Esegui supabase/migrations/002_seed.sql → inserisce 20 risorse seed
3. Verifica: SELECT count(*), type FROM resources GROUP BY type;
```

### 3. Test locale

```bash
npm run dev
```

Verificare:
- Homepage mostra le 20 risorse
- Search funziona (prova "Claude")
- Filtri funzionano (clicca "Tool", poi "Delivery")
- Pagina dettaglio /resources/claude-code mostra expert take
- Tag cliccabili riportano alla homepage filtrata

### 4. Configurare Raindrop Sync

```
1. Ottenere Raindrop API token da raindrop.io/settings → integrations
2. In Supabase Dashboard → Edge Functions → Secrets, aggiungere:
   - RAINDROP_TOKEN
   - ANTHROPIC_API_KEY
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
3. Deploy: supabase functions deploy sync-raindrop --project-ref PROJECT_REF
4. Test: salvare bookmark su Raindrop con tag #builder-dir → invoke function → verificare in DB
```

### 5. Deploy su Vercel

```bash
# Push su GitHub
gh repo create product-builder-directory --public --source=. --push

# Oppure collega manualmente su vercel.com/new
# Env vars da configurare su Vercel:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

### 6. Test MCP queries (per demo webinar)

Con Supabase MCP connesso, testare:
1. "Mostrami tutti i tool ordinati per categoria"
2. "Quale tool mi consigli per deployare un'app Next.js?"
3. "Quanti tool abbiamo per categoria?"
4. "Aggiungi Linear come tool di produttività, url linear.app"
5. "Rimuovi il tool che abbiamo appena aggiunto"

### 7. Preparare branch demo (pre-webinar 17 marzo)

```bash
git checkout -b demo-backup   # progetto GSD inizializzato, vuoto
git checkout -b demo-v2       # 50% buildato + deploy Vercel come fallback
```

---

## File chiave

| File | Cosa fa |
|------|---------|
| `SPEC.md` | Spec prodotto per input a GSD |
| `CHECKLIST.md` | Checklist dettagliata di tutte le fasi |
| `supabase/migrations/001_init.sql` | Schema DB completo |
| `supabase/migrations/002_seed.sql` | 20 risorse seed |
| `supabase/functions/sync-raindrop/index.ts` | Edge function Raindrop → DB + AI |
| `.mcp.json` | Config Supabase MCP (gitignored, da aggiornare con credenziali reali) |
| `lib/queries.ts` | Query layer Supabase |
| `app/page.tsx` | Homepage con search + filtri |
| `app/resources/[slug]/page.tsx` | Pagina dettaglio risorsa |

## Stack

Next.js 16 + Supabase + Vercel + shadcn/ui + Tailwind v3

## Note

- Il template usa `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (NON `ANON_KEY`)
- `.mcp.json` è gitignored — contiene la service role key
- La Edge Function usa Claude Haiku per l'enrichment AI (economico e veloce)
