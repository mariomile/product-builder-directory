"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  TYPES,
  PILLARS,
  LEVELS,
  TYPE_LABELS,
  PILLAR_LABELS,
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowUpRight,
  Filter,
  Search,
  Layers,
  BarChart3,
  Sparkles,
  ExternalLink,
  ArrowLeft,
  X,
} from "lucide-react";

type SearchResult = {
  id: string;
  slug: string;
  name: string;
  url: string;
  description: string;
  type: string;
  pillar: string;
  level: string;
  tags: string[];
  is_free: boolean;
  is_featured: boolean;
  expert_take: string | null;
  author: string | null;
};

type ActiveFilter = {
  key: "type" | "pillar" | "level" | "free";
  value: string;
  label: string;
};

function sanitizeSearch(raw: string): string {
  return raw.replace(/[,().%"'\\;|*]/g, "").trim().slice(0, 100);
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  // Global Cmd+K listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Reset state when closing
  useEffect(() => {
    if (!open) {
      setSearch("");
      setResults([]);
      setSelectedId(null);
      setActiveFilter(null);
    }
  }, [open]);

  // Fetch resources — triggered by search text or active filter
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const safe = sanitizeSearch(search);
    const hasSearch = safe.length >= 2;
    const hasFilter = activeFilter !== null;

    if (!hasSearch && !hasFilter) {
      setResults([]);
      setSelectedId(null);
      return;
    }

    setLoading(true);
    const currentRequestId = ++requestIdRef.current;
    const delay = hasSearch ? 300 : 0; // no debounce for filter selection

    debounceRef.current = setTimeout(async () => {
      try {
        const supabase = createClient();
        let query = supabase
          .from("resources")
          .select(
            "id, slug, name, url, description, type, pillar, level, tags, is_free, is_featured, expert_take, author"
          );

        // Apply text search
        if (hasSearch) {
          query = query.or(
            `name.ilike.%${safe}%,description.ilike.%${safe}%,expert_take.ilike.%${safe}%`
          );
        }

        // Apply active filter
        if (hasFilter) {
          if (activeFilter.key === "free") {
            query = query.eq("is_free", activeFilter.value === "true");
          } else {
            query = query.eq(activeFilter.key, activeFilter.value);
          }
        }

        const { data } = await query
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(20);

        if (currentRequestId !== requestIdRef.current) return;

        const items = (data ?? []) as SearchResult[];
        setResults(items);
        setSelectedId(items[0]?.id ?? null);
      } catch {
        if (currentRequestId === requestIdRef.current) {
          setResults([]);
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, delay);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, activeFilter]);

  const applyFilter = useCallback((filter: ActiveFilter) => {
    setActiveFilter(filter);
    setSearch("");
  }, []);

  const clearFilter = useCallback(() => {
    setActiveFilter(null);
    setResults([]);
    setSelectedId(null);
  }, []);

  const openExternal = useCallback((url: string) => {
    setOpen(false);
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const selectedResource =
    results.find((r) => r.id === selectedId) ?? results[0] ?? null;

  const hasResults = results.length > 0;
  const isSearching = sanitizeSearch(search).length >= 2;
  const showQuickActions = !isSearching && !activeFilter;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 max-w-4xl top-[15%] translate-y-0 gap-0">
        <DialogTitle className="sr-only">Search resources</DialogTitle>
        <Command
          className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:font-mono"
          shouldFilter={false}
        >
          {/* Search input + active filter badge */}
          <div className="flex items-center border-b border-border px-4 gap-2">
            {activeFilter ? (
              <button
                onClick={clearFilter}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <span className="text-primary font-bold flex-shrink-0 select-none text-base">
                {">"}
              </span>
            )}
            {activeFilter && (
              <button
                onClick={clearFilter}
                className="flex-shrink-0 flex items-center gap-1.5 border border-primary text-primary px-2 py-0.5 text-xs font-mono hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {activeFilter.label}
                <X className="h-3 w-3" />
              </button>
            )}
            <CommandInput
              placeholder={
                activeFilter
                  ? "filter within results..."
                  : "search_resources..."
              }
              value={search}
              onValueChange={setSearch}
              className="border-0"
            />
            {loading && (
              <div className="h-3 w-3 border border-muted-foreground border-t-transparent animate-spin flex-shrink-0" />
            )}
          </div>

          {/* Split pane: list + preview */}
          <div className="flex min-h-[350px] max-h-[500px]">
            {/* Left pane — results list */}
            <div className="w-1/2 border-r border-border overflow-y-auto">
              <CommandList className="max-h-none">
                <CommandEmpty>
                  <span className="text-muted-foreground font-mono text-xs">
                    // no results found
                  </span>
                </CommandEmpty>

                {/* Resources results (from search or filter) */}
                {hasResults && (
                  <CommandGroup
                    heading={
                      activeFilter
                        ? `// ${activeFilter.label.toLowerCase()} [${results.length}]`
                        : "// resources"
                    }
                  >
                    {results.map((resource) => (
                      <CommandItem
                        key={resource.id}
                        value={resource.id}
                        onSelect={() => openExternal(resource.url)}
                        onMouseEnter={() => setSelectedId(resource.id)}
                        data-selected={selectedId === resource.id}
                        className={
                          selectedId === resource.id
                            ? "bg-accent border-l-2 border-l-primary"
                            : ""
                        }
                      >
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <span className="text-sm truncate">
                            {resource.name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            [{TYPE_LABELS[resource.type] || resource.type} →{" "}
                            {PILLAR_LABELS[resource.pillar] || resource.pillar}]
                          </span>
                        </div>
                        <ArrowUpRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Quick actions — show when no search and no filter active */}
                {showQuickActions && (
                  <>
                    <CommandGroup heading="// filter by type">
                      {TYPES.map((t) => (
                        <CommandItem
                          key={`type-${t.value}`}
                          value={`type-${t.value}`}
                          onSelect={() =>
                            applyFilter({
                              key: "type",
                              value: t.value,
                              label: t.label,
                            })
                          }
                        >
                          <Filter className="h-3 w-3 text-muted-foreground" />
                          <span>{t.label}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="// filter by pillar">
                      {PILLARS.map((p) => (
                        <CommandItem
                          key={`pillar-${p.value}`}
                          value={`pillar-${p.value}`}
                          onSelect={() =>
                            applyFilter({
                              key: "pillar",
                              value: p.value,
                              label: p.label,
                            })
                          }
                        >
                          <Layers className="h-3 w-3 text-muted-foreground" />
                          <span>{p.label}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="// filter by level">
                      {LEVELS.map((l) => (
                        <CommandItem
                          key={`level-${l.value}`}
                          value={`level-${l.value}`}
                          onSelect={() =>
                            applyFilter({
                              key: "level",
                              value: l.value,
                              label: l.label,
                            })
                          }
                        >
                          <BarChart3 className="h-3 w-3 text-muted-foreground" />
                          <span>{l.label}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="// price">
                      <CommandItem
                        value="free"
                        onSelect={() =>
                          applyFilter({
                            key: "free",
                            value: "true",
                            label: "Free",
                          })
                        }
                      >
                        <Sparkles className="h-3 w-3 text-muted-foreground" />
                        <span>Free resources</span>
                      </CommandItem>
                      <CommandItem
                        value="paid"
                        onSelect={() =>
                          applyFilter({
                            key: "free",
                            value: "false",
                            label: "Paid",
                          })
                        }
                      >
                        <Sparkles className="h-3 w-3 text-muted-foreground" />
                        <span>Paid resources</span>
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </div>

            {/* Right pane — preview */}
            <div className="w-1/2 p-5 overflow-y-auto bg-background/50">
              {selectedResource ? (
                <div key={selectedId} className="flex flex-col gap-4 animate-fade-in">
                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        [
                        {TYPE_LABELS[selectedResource.type] ||
                          selectedResource.type}{" "}
                        →{" "}
                        {PILLAR_LABELS[selectedResource.pillar] ||
                          selectedResource.pillar}
                        ]
                      </span>
                      <span
                        className={`text-xs font-mono ${
                          selectedResource.is_free
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        [{selectedResource.is_free ? "FREE" : "PAID"}]
                      </span>
                    </div>
                    <h3 className="text-lg font-bold leading-tight">
                      {selectedResource.name}
                    </h3>
                    {selectedResource.author && (
                      <p className="text-xs text-muted-foreground mt-1">
                        by {selectedResource.author}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  {selectedResource.description && (
                    <div>
                      <p className="text-xs text-muted-foreground font-mono mb-1">
                        // description
                      </p>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {selectedResource.description}
                      </p>
                    </div>
                  )}

                  {/* Expert take */}
                  {selectedResource.expert_take && (
                    <div>
                      <p className="text-xs text-muted-foreground font-mono mb-1">
                        // expert take
                      </p>
                      <p className="text-sm text-foreground/80 leading-relaxed italic">
                        &quot;{selectedResource.expert_take}&quot;
                      </p>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-mono text-muted-foreground border border-border px-2 py-0.5">
                      {selectedResource.level}
                    </span>
                    {selectedResource.is_featured && (
                      <span className="text-xs font-mono text-primary border border-primary px-2 py-0.5">
                        FEATURED
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {selectedResource.tags.length > 0 && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {selectedResource.tags.map((t) => `#${t}`).join("  ")}
                    </p>
                  )}

                  {/* Open button */}
                  <button
                    onClick={() => openExternal(selectedResource.url)}
                    className="mt-auto flex items-center justify-center gap-2 border border-primary text-primary px-4 py-2 text-sm font-mono hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open resource
                  </button>
                </div>
              ) : isSearching || activeFilter ? (
                <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-xs">
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 border border-muted-foreground border-t-transparent animate-spin" />
                      searching...
                    </div>
                  ) : (
                    "// select a result to preview"
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground font-mono text-xs gap-3">
                  <Search className="h-8 w-8 text-border" />
                  <p>// type to search resources</p>
                  <div className="flex items-center gap-4 mt-4 text-[10px]">
                    <span className="flex items-center gap-1">
                      <kbd className="border border-border px-1.5 py-0.5">
                        ↑↓
                      </kbd>
                      navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="border border-border px-1.5 py-0.5">
                        ↵
                      </kbd>
                      select
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="border border-border px-1.5 py-0.5">
                        esc
                      </kbd>
                      close
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[10px] text-muted-foreground font-mono">
            <span>product_builder_dir</span>
            <div className="flex items-center gap-4">
              {activeFilter && (
                <span className="flex items-center gap-1">
                  <kbd className="border border-border px-1 py-0.5">←</kbd>
                  back
                </span>
              )}
              <span className="flex items-center gap-1">
                <kbd className="border border-border px-1 py-0.5">⌘K</kbd>
                toggle
              </span>
              <span className="flex items-center gap-1">
                <kbd className="border border-border px-1 py-0.5">esc</kbd>
                close
              </span>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
