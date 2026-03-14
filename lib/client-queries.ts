import { createClient } from "@/lib/supabase/client";

export async function getFilteredCountClient(filters: {
  search?: string;
  type?: string | null;
  pillar?: string | null;
  level?: string | null;
  free?: string | null;
}): Promise<number> {
  const supabase = createClient();
  let query = supabase
    .from("resources")
    .select("*", { count: "exact", head: true });

  if (filters.search) {
    const safe = filters.search
      .replace(/[,().%"'\\;|*]/g, "")
      .trim()
      .slice(0, 100);
    if (safe)
      query = query.or(
        `name.ilike.%${safe}%,description.ilike.%${safe}%,expert_take.ilike.%${safe}%`
      );
  }
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.pillar) query = query.eq("pillar", filters.pillar);
  if (filters.level) query = query.eq("level", filters.level);
  if (filters.free === "true") query = query.eq("is_free", true);
  if (filters.free === "false") query = query.eq("is_free", false);

  const { count } = await query;
  return count ?? 0;
}
