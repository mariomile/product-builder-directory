// Raindrop Sync Edge Function
// Fetches bookmarks tagged "builder-dir" from Raindrop.io,
// enriches them with AI (Gemini), and inserts into resources table.
//
// Required secrets (set via Supabase Dashboard → Edge Functions → Secrets):
// - RAINDROP_TOKEN
// - GEMINI_API_KEY
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY
//
// Trigger: cron every 6 hours, or invoke manually

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RAINDROP_TOKEN = Deno.env.get("RAINDROP_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;

const RAINDROP_TAG = "builder-dir";

interface RaindropItem {
  _id: number;
  title: string;
  link: string;
  excerpt: string;
  tags: string[];
  created: string;
}

interface AIClassification {
  type: string;
  pillar: string;
  level: string;
  expert_take: string;
  tags: string[];
  is_free: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function cleanName(raw: string): string {
  return raw
    // Strip GitHub "user/repo: description" prefix
    .replace(/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+:\s*/, "")
    // Strip "path/to/thing at branch · org/repo" suffix
    .replace(/\s+at\s+\w+\s+·\s+[\w/-]+$/, "")
    // Strip trailing " | Site Name" or " — tagline"
    .replace(/\s*[|—–]\s*[^|—–]+$/, "")
    .trim();
}

async function fetchRaindropBookmarks(): Promise<RaindropItem[]> {
  const url = `https://api.raindrop.io/rest/v1/raindrops/0?search=%23${RAINDROP_TAG}&perpage=50`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${RAINDROP_TOKEN}` },
  });

  if (!res.ok) {
    throw new Error(`Raindrop API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.items || [];
}

async function classifyWithGemini(
  name: string,
  url: string,
  excerpt: string,
  tags: string[]
): Promise<AIClassification> {
  const prompt = `You are classifying a resource for a Product Builder Directory (for PMs, Designers, and Engineers building with AI).

Resource: "${name}"
URL: ${url}
Description: ${excerpt}
Tags: ${tags.join(", ")}

Classify this resource and respond with ONLY a valid JSON object. No markdown, no explanation, just JSON.

Rules:
- type must be exactly one of: tool, course, article, newsletter, book, podcast, video, community, x_post, framework
- pillar must be exactly one of: discovery, design, delivery, strategy, stack, meta_skill
- level must be exactly one of: beginner, intermediate, advanced
- expert_take: 2-3 sentences on why a product builder should care. Be specific and opinionated.
- tags: array of 3-5 lowercase strings (e.g. ["claude-code", "vibe-coding", "user-research"])
- is_free: boolean — true if the core resource is free to use (open-source, free tier, free content), false if it requires payment

Example output:
{"type":"tool","pillar":"delivery","level":"intermediate","expert_take":"This tool accelerates...","tags":["ai","productivity"],"is_free":true}

Now classify the resource above:`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2048, temperature: 0.1, responseMimeType: "application/json" },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const text = data.candidates[0].content.parts[0].text.trim();
  // Strip markdown code fences if present
  const json = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(json);
}

Deno.serve(async (req) => {
  // Reject requests without valid authorization
  // SYNC_SECRET is set in Supabase Dashboard -> Edge Functions -> Secrets
  // Phase 4 cron configuration must pass this header.
  const authHeader = req.headers.get("Authorization");
  const expectedToken = Deno.env.get("SYNC_SECRET");
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Diagnostica: ?action=list-models
  const reqUrl = new URL(req.url);
  if (reqUrl.searchParams.get("action") === "list-models") {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}&pageSize=50`);
    const data = await r.json();
    return Response.json(data);
  }

  try {
    // Allow only POST or GET (for cron)
    if (req.method !== "POST" && req.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Fetch bookmarks from Raindrop
    const bookmarks = await fetchRaindropBookmarks();

    if (bookmarks.length === 0) {
      return Response.json({ message: "No bookmarks found", synced: 0 });
    }

    // 2. Check which ones are already in DB
    const raindropIds = bookmarks.map((b) => String(b._id));
    const { data: existing } = await supabase
      .from("resources")
      .select("raindrop_id")
      .in("raindrop_id", raindropIds);

    const existingIds = new Set(
      (existing || []).map((r: { raindrop_id: string }) => r.raindrop_id)
    );
    const newBookmarks = bookmarks.filter(
      (b) => !existingIds.has(String(b._id))
    );

    if (newBookmarks.length === 0) {
      return Response.json({
        message: "All bookmarks already synced",
        synced: 0,
      });
    }

    // 3. For each new bookmark, classify with AI and insert
    const results = [];
    for (const bookmark of newBookmarks) {
      try {
        const name = cleanName(bookmark.title);
        const classification = await classifyWithGemini(
          name,
          bookmark.link,
          bookmark.excerpt,
          bookmark.tags.filter((t) => t !== RAINDROP_TAG)
        );

        const slug = slugify(name);

        const { error } = await supabase.from("resources").insert({
          slug,
          name,
          url: bookmark.link,
          description: bookmark.excerpt || "",
          type: classification.type,
          pillar: classification.pillar,
          level: classification.level,
          tags: classification.tags,
          expert_take: classification.expert_take,
          language: "en",
          is_free: classification.is_free ?? true,
          is_featured: false,
          raindrop_id: String(bookmark._id),
        });

        if (error) {
          results.push({ name, status: "error", error: error.message });
        } else {
          results.push({ name, status: "synced" });
        }
      } catch (err) {
        results.push({
          name: bookmark.title,
          status: "error",
          error: String(err),
        });
      }
    }

    return Response.json({
      message: `Synced ${results.filter((r) => r.status === "synced").length} new resources`,
      total_found: bookmarks.length,
      already_synced: existingIds.size,
      results,
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
});
