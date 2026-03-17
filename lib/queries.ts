import { createClient } from "@/lib/supabase/server";

export type Resource = {
  id: string;
  slug: string;
  name: string;
  url: string;
  description: string;
  type: string;
  pillar: string;
  tags: string[];
  level: string;
  author: string | null;
  expert_take: string | null;
  language: string;
  is_free: boolean;
  is_featured: boolean;
  logo_url: string | null;
  raindrop_id: string | null;
  created_at: string;
  updated_at: string;
};

function sanitizeSearch(raw: string): string {
  // Strip PostgREST operator chars: comma separates conditions,
  // parens/dot are filter syntax, others are injection vectors
  return raw.replace(/[,().%"'\\;|*]/g, "").trim().slice(0, 100);
}

const PAGE_SIZE = 20;

export async function getResources(params: {
  search?: string;
  type?: string | string[];
  pillar?: string | string[];
  level?: string | string[];
  free?: string;
  page?: string;
}): Promise<{ data: Resource[]; filteredCount: number; totalPages: number; currentPage: number }> {
  const supabase = await createClient();
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase.from("resources").select("*", { count: "exact" });

  if (params.search) {
    const safe = sanitizeSearch(params.search);
    if (safe) {
      query = query.or(
        `name.ilike.%${safe}%,description.ilike.%${safe}%,expert_take.ilike.%${safe}%`
      );
    }
  }
  if (params.type) {
    const vals = Array.isArray(params.type) ? params.type : [params.type];
    query = vals.length === 1 ? query.eq("type", vals[0]) : query.in("type", vals);
  }
  if (params.pillar) {
    const vals = Array.isArray(params.pillar) ? params.pillar : [params.pillar];
    query = vals.length === 1 ? query.eq("pillar", vals[0]) : query.in("pillar", vals);
  }
  if (params.level) {
    const vals = Array.isArray(params.level) ? params.level : [params.level];
    query = vals.length === 1 ? query.eq("level", vals[0]) : query.in("level", vals);
  }
  if (params.free === "true") query = query.eq("is_free", true);
  if (params.free === "false") query = query.eq("is_free", false);

  const { data, count, error } = await query
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) throw error;
  const filteredCount = count ?? 0;
  return {
    data: data as Resource[],
    filteredCount,
    totalPages: Math.ceil(filteredCount / PAGE_SIZE),
    currentPage: page,
  };
}

export async function getResourceBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data as Resource;
}

export async function getRelatedResources(pillar: string, excludeSlug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("pillar", pillar)
    .neq("slug", excludeSlug)
    .order("is_featured", { ascending: false })
    .limit(4);

  if (error) throw error;
  return data as Resource[];
}

export async function getRelatedByTags(
  tags: string[],
  excludeSlug: string,
  limit = 4
) {
  if (!tags.length) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .overlaps("tags", tags)
    .neq("slug", excludeSlug)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Resource[];
}

export async function getResourceCount() {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("resources")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count ?? 0;
}
