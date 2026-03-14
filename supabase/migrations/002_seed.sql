-- Product Builder Directory — Seed Data
-- 20 real resources across all types and pillars
-- Applied manually. Tracked retroactively in supabase_migrations.schema_migrations
-- as version 20240101000002 on 2026-03-13. DO NOT re-run (would fail on slug unique constraint).

INSERT INTO resources (slug, name, url, description, type, pillar, tags, level, author, expert_take, language, is_free, is_featured) VALUES

-- TOOLS — Delivery
('claude-code', 'Claude Code', 'https://docs.anthropic.com/en/docs/claude-code',
 'CLI di Anthropic per coding con Claude direttamente dal terminale. Capisce il progetto intero, non solo il file aperto.',
 'tool', 'delivery', ARRAY['cli', 'ai', 'coding', 'typescript', 'claude'],
 'intermediate', 'Anthropic',
 'Il pair programmer AI più potente del 2026. Capisce l''architettura del progetto intero, naviga il codebase, e fa refactoring cross-file. Se buildi prodotti, è il tuo co-pilot.',
 'en', true, true),

('cursor', 'Cursor', 'https://cursor.sh',
 'IDE basato su VS Code con AI integrata. Tab completion, chat nel codice, e agent mode per task complessi.',
 'tool', 'delivery', ARRAY['ide', 'ai', 'coding', 'vscode'],
 'beginner', 'Anysphere',
 'L''IDE che ha reso il vibe coding mainstream. Se vieni da VS Code, la transizione è zero. Agent mode + Composer cambiano il modo in cui pensi al codice.',
 'en', false, true),

('conductor-build', 'Conductor', 'https://conductor.build',
 'Mac app per orchestrare team di coding agents in parallelo su Git worktrees isolati.',
 'tool', 'delivery', ARRAY['ai', 'agents', 'claude-code', 'orchestration', 'git'],
 'advanced', 'Conductor',
 'Lancia Claude Code e Codex in worktree Git isolati. Ogni agente lavora in parallelo, tu mergi. Il multiplier per chi ha capito che un solo agent non basta.',
 'en', false, true),

('gsd', 'GSD — Get Shit Done', 'https://github.com/gsd-build/get-shit-done',
 'Framework per Claude Code: fresh contexts, piani atomici, wave execution. Da prompt casuale a processo ripetibile.',
 'tool', 'meta_skill', ARRAY['workflow', 'ai', 'claude-code', 'methodology', 'context-engineering'],
 'intermediate', 'GSD Build',
 'La differenza tra chi shippa e chi no è avere un processo. GSD è quel processo: discuss → plan → execute → verify. Context engineering applicato.',
 'en', true, true),

('lovable', 'Lovable', 'https://lovable.dev',
 'Genera web app funzionanti da prompt in linguaggio naturale. Frontend, backend, database — tutto in una volta.',
 'tool', 'delivery', ARRAY['ai', 'no-code', 'fullstack', 'prototyping'],
 'beginner', 'Lovable',
 'Il modo più veloce per andare da idea a prototipo funzionante. Non è per production, ma per validare in ore quello che prima richiedeva settimane.',
 'en', false, false),

-- TOOLS — Stack
('supabase', 'Supabase', 'https://supabase.com',
 'Backend-as-a-service: PostgreSQL, auth, storage, realtime, edge functions. Tutto in uno.',
 'tool', 'stack', ARRAY['postgresql', 'auth', 'storage', 'backend', 'database'],
 'beginner', 'Supabase',
 'Da zero a backend in produzione in 5 minuti. PostgreSQL sotto, API REST sopra, auth inclusa. Lo stack di default per product builder nel 2026.',
 'en', false, true),

('nextjs', 'Next.js', 'https://nextjs.org',
 'Framework React per il web. SSR, App Router, Server Components, API routes.',
 'tool', 'stack', ARRAY['react', 'typescript', 'ssr', 'fullstack', 'framework'],
 'intermediate', 'Vercel',
 'La scelta sicura nel 2026. Riduci le decisioni architetturali e focalizzi sul prodotto. Server Components + App Router = meno codice, più velocità.',
 'en', true, true),

('vercel', 'Vercel', 'https://vercel.com',
 'Platform per deploy automatico. Push su Git, il sito è live in 30 secondi con preview per ogni branch.',
 'tool', 'stack', ARRAY['hosting', 'ci-cd', 'edge', 'serverless', 'deploy'],
 'beginner', 'Vercel',
 'Elimina il DevOps dalla tua vita. Ogni push genera un deploy con URL di preview. Il builder non dovrebbe pensare all''infrastruttura.',
 'en', false, false),

('shadcn-ui', 'shadcn/ui', 'https://ui.shadcn.com',
 'Componenti React su Radix UI + Tailwind. Non una libreria: il codice è nel tuo progetto, modificabile senza limiti.',
 'tool', 'stack', ARRAY['react', 'tailwind', 'components', 'ui', 'design-system'],
 'beginner', 'shadcn',
 'UI professionale in minuti. I componenti sono nel tuo codebase — nessun vendor lock-in, nessuna dipendenza da aggiornare. Lo standard de facto per builder.',
 'en', true, true),

-- TOOLS — Design
('v0-dev', 'v0.dev', 'https://v0.dev',
 'Generatore AI di UI. Descrivi un componente in linguaggio naturale, ottieni codice React + Tailwind pronto.',
 'tool', 'design', ARRAY['ai', 'react', 'tailwind', 'generative', 'ui', 'prototyping'],
 'beginner', 'Vercel',
 'Elimina il blocco del foglio bianco. Descrivi, itera, copia nel progetto. Il ponte tra designer e codice che mancava.',
 'en', false, true),

-- TOOLS — Discovery
('granola-ai', 'Granola', 'https://granola.so',
 'AI meeting notes che cattura trascrizioni, decisioni e action items automaticamente.',
 'tool', 'discovery', ARRAY['meetings', 'transcription', 'ai', 'notes', 'research'],
 'beginner', 'Granola',
 'Smetti di prendere appunti nelle interviste utente. Granola registra, trascrive e estrae insight. Tu fai le domande giuste.',
 'en', false, false),

-- COURSES
('reforge', 'Reforge', 'https://reforge.com',
 'Programmi avanzati su product, growth, marketing e strategy. Il gold standard per PM mid-senior.',
 'course', 'strategy', ARRAY['product', 'growth', 'strategy', 'advanced'],
 'advanced', 'Reforge',
 'Non è un corso, è un operating system per pensare al prodotto. Se sei oltre il livello junior, Reforge è dove consolidi i framework che userai per anni.',
 'en', false, true),

('harvard-ai-product', 'Harvard — Product Development with AI', 'https://professional.dce.harvard.edu/programs/product-development-with-ai-from-idea-to-market-in-half-the-time/',
 'Programma Harvard su come usare AI per user research, prototyping no-code, e micro-esperimenti.',
 'course', 'discovery', ARRAY['ai', 'research', 'prototyping', 'validation', 'harvard'],
 'intermediate', 'Harvard DCE',
 'Harvard che insegna a usare AI per fare product discovery in ore invece che settimane. Abductive reasoning + AI prototyping. Il futuro della ricerca utente.',
 'en', false, false),

-- ARTICLES
('ai-product-engineer', 'The AI-Powered Product Engineer', 'https://medium.com/@rich_archbold/the-ai-powered-product-engineer-a-new-engineering-archetype-3119ed9716e4',
 'Definisce il nuovo archetipo: product engineer fluente in AI-assisted execution.',
 'article', 'delivery', ARRAY['product-engineer', 'ai', 'archetype', 'career'],
 'intermediate', 'Rich Archbold',
 'L''articolo che ha definito il ruolo. Product sense + systems design + AI execution = il builder del 2026. Se leggi un solo articolo su chi devi diventare, è questo.',
 'en', true, false),

('ai-makes-us-builders', 'Will AI make us all product builders?', 'https://www.fundament.design/p/will-ai-make-us-all-product-builders',
 'Esplora come AI sta facendo convergere PM, designer e engineer in un unico ruolo: il product builder.',
 'article', 'strategy', ARRAY['product-builder', 'ai', 'future', 'convergence', 'roles'],
 'beginner', 'Fundament Design',
 'La tesi centrale: PM, designer e engineer stanno convergendo. AI è il catalizzatore. Chi abbraccia tutte e tre le discipline vince. Chi si specializza e basta, rischia.',
 'en', true, false),

-- NEWSLETTERS
('lennys-newsletter', 'Lenny''s Newsletter', 'https://www.lennysnewsletter.com',
 'La newsletter #1 al mondo su product, growth, e career nel tech. Interviste, framework, dati.',
 'newsletter', 'strategy', ARRAY['product', 'growth', 'career', 'interviews', 'frameworks'],
 'beginner', 'Lenny Rachitsky',
 'Se leggi una sola newsletter di prodotto, è questa. Lenny ha il network e i dati che nessun altro ha. Ogni issue è un mini-corso.',
 'en', true, true),

-- BOOKS
('continuous-discovery', 'Continuous Discovery Habits', 'https://www.producttalk.org/2021/05/continuous-discovery-habits/',
 'Il libro definitivo su come fare discovery in modo continuo, non a progetto. Opportunity Solution Trees, interviste settimanali.',
 'book', 'discovery', ARRAY['discovery', 'user-research', 'ost', 'interviews', 'habits'],
 'intermediate', 'Teresa Torres',
 'Il framework di discovery che ogni builder dovrebbe avere nel DNA. Non è teoria — è un sistema operativo per prendere decisioni di prodotto basate su evidenze.',
 'en', false, true),

-- COMMUNITY
('product-heroes', 'Product Heroes', 'https://productheroes.it',
 'La community italiana di riferimento per product manager e product builder. Corsi, eventi, webinar.',
 'community', 'strategy', ARRAY['community', 'italy', 'product', 'networking', 'courses'],
 'beginner', 'Product Heroes',
 'Se sei un PM o builder in Italia, Product Heroes è la tua community. Contenuti di qualità, network reale, e il ponte tra il mondo italiano e quello internazionale.',
 'it', true, true),

-- X-POSTS
('shreyas-ai-building', 'Shreyas Doshi — AI-Assisted Product Building Thread', 'https://x.com/shreyas',
 'Thread su come i migliori PM stanno usando AI per fare il lavoro di 3 persone: research, design, e delivery.',
 'x_post', 'delivery', ARRAY['ai', 'product-building', 'workflow', 'shreyas'],
 'intermediate', 'Shreyas Doshi',
 'Shreyas ha 20+ anni in prodotto (Google, Stripe, Twitter). Quando dice che AI cambia il ruolo del PM, vale la pena ascoltare. Thread denso di insight pratici.',
 'en', true, false),

-- TOOLS — Meta-skill
('n8n', 'n8n', 'https://n8n.io',
 'Automazione workflow open-source. Connette API con editor visuale. Self-hostable.',
 'tool', 'meta_skill', ARRAY['workflow', 'automation', 'api', 'no-code', 'open-source'],
 'intermediate', 'n8n',
 'Zapier open-source ma più potente. Self-hostable, zero costi ricorrenti. Il builder che automatizza i propri workflow è 10x più produttivo.',
 'en', true, false);
