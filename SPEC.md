# Product Builder Directory — SPEC

## Product Vision

Product Builder Directory è una directory curata di tool, risorse e contenuti per product builder — persone che uniscono product management, design e engineering usando AI (Claude Code, Cursor, v0, etc.) per fare discovery, design e delivery in autonomia.

**Value prop:** "Evita il noise. Solo le migliori risorse sul Product Building, testate e curate da un team di esperti."

## User Personas

**Sofia — PM (32, Milano):** Non ha tempo di provare 50 tool. Vuole filtrare per categoria e trovare i 3 giusti per il suo caso. Cerca, salva, condivide col team.

**Luca — Indie Hacker (27, Torino):** Vuole uno stack opinionated per partire. Cerca per stack tag (react, supabase), confronta alternative.

**Andrea — Head of Product (38, Roma):** Vuole standardizzare i tool del team. Filtra per pillar, legge expert take, decide per tutti.

## User Stories

- As Sofia, I want to see all resources on the homepage so that I can browse without signing up.
- As Luca, I want to search resources by name so that I can quickly find a specific tool or article.
- As Andrea, I want to filter resources by pillar (discovery/design/delivery) so that I find relevant content.
- As Luca, I want to filter by type (tool, course, article) so that I find the right format.
- As Sofia, I want to combine filters with search.
- As Sofia, I want to read an expert take for each resource so that I understand WHY to use it.
- As Luca, I want to click through to a resource's website to access it immediately.
- As Mario (admin), I want new Raindrop bookmarks to auto-sync into the directory.
- As Mario (admin), I want Claude to query the DB via Supabase MCP for the live demo.

## Architecture

```
BROWSER → Next.js 16 (Vercel) → Supabase PostgreSQL
                                      ↑
                              Claude Code + MCP

Raindrop.io → (cron) → Supabase Edge Function → INSERT + AI enrichment
```

**Stack:** Next.js 16 + Supabase + Vercel + shadcn/ui + Tailwind CSS

## Data Model

**resources** table with: slug, name, url, description, type (enum: tool/course/article/newsletter/book/podcast/video/community/x_post/framework), pillar (enum: discovery/design/delivery/strategy/stack/meta_skill), tags (text[]), level (enum: beginner/intermediate/advanced), author, expert_take, language, is_free, is_featured, logo_url, raindrop_id

## 6 Pillars

1. **Discovery con AI** — user research, interview analysis, problem framing
2. **Design con AI** — v0, Figma AI, vibe coding, prototyping
3. **Delivery con AI** — Claude Code, Cursor, Conductor, GSD, multi-agent
4. **Product Strategy** — AI-native product thinking, positioning
5. **Stack & Tools** — Next.js, Supabase, Vercel, shadcn/ui, infra
6. **Meta-skill** — prompt engineering, context engineering, workflows

## Definition of Done MVP

- Homepage con griglia risorse responsive
- Search bar full-text fuzzy
- Filtri combinabili: tipo, pillar, level, free/paid
- Pagina dettaglio /resources/[slug] con expert take
- Risorse featured in evidenza
- 20 risorse seed reali
- Raindrop sync (cron + AI enrichment)
- Supabase MCP configurato
- Deploy su Vercel con URL condivisibile

## NON nel MVP

Auth utenti, preferiti, learning paths, rating, dark mode toggle, pagine About/Blog
