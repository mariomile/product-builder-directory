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

export async function getResources(params: {
  search?: string;
  type?: string;
  pillar?: string;
  level?: string;
  free?: string;
}) {
  const supabase = await createClient();
  let query = supabase.from("resources").select("*");

  if (params.search) {
    query = query.or(
      `name.ilike.%${params.search}%,description.ilike.%${params.search}%,expert_take.ilike.%${params.search}%`
    );
  }
  if (params.type) query = query.eq("type", params.type);
  if (params.pillar) query = query.eq("pillar", params.pillar);
  if (params.level) query = query.eq("level", params.level);
  if (params.free === "true") query = query.eq("is_free", true);
  if (params.free === "false") query = query.eq("is_free", false);

  const { data, error } = await query
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Resource[];
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

export async function getResourceCount() {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("resources")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count ?? 0;
}
