import { getResources } from "@/lib/queries";
import { ResourceCard } from "@/components/resource-card";
import { PaginationBar } from "@/components/pagination-bar";
import { KeyboardNav } from "@/components/keyboard-nav";

export async function ResourceGrid({
  searchParams,
}: {
  searchParams: {
    search?: string;
    type?: string | string[];
    pillar?: string | string[];
    level?: string | string[];
    free?: string;
    page?: string;
  };
}) {
  const { data: resources, filteredCount, totalPages, currentPage } =
    await getResources(searchParams);

  const paramsKey = JSON.stringify(searchParams);

  return (
    <>
      <p className="text-xs font-mono text-muted-foreground mb-6">
        // {filteredCount} resource{filteredCount !== 1 ? "s" : ""} found
      </p>

      <section className="scanline-wrap" key={paramsKey}>
        {resources.length === 0 ? (
          <div className="py-16 border border-border flex flex-col items-center gap-2 animate-fade-up">
            <p className="text-muted-foreground font-mono text-sm cursor-blink">
              // no resources matched your query
            </p>
            <p className="text-muted-foreground/60 font-mono text-xs">
              // try broadening your filters or press ⌘K to explore
            </p>
          </div>
        ) : (
          <KeyboardNav>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((resource, i) => (
                <ResourceCard key={resource.id} resource={resource} index={i} />
              ))}
            </div>

            <div className="mt-8">
              <PaginationBar currentPage={currentPage} totalPages={totalPages} />
            </div>
          </KeyboardNav>
        )}
      </section>
    </>
  );
}
