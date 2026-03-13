import { getResources } from "@/lib/queries";
import { ResourceCard } from "@/components/resource-card";
import { PaginationBar } from "@/components/pagination-bar";

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <span className="text-xs font-mono text-muted-foreground flex-shrink-0">{label}</span>
      <div className="flex-1 border-t border-border" />
    </div>
  );
}

export async function ResourceGrid({
  searchParams,
}: {
  searchParams: {
    search?: string;
    type?: string;
    pillar?: string;
    level?: string;
    free?: string;
    page?: string;
  };
}) {
  const { data: resources, filteredCount, totalPages, currentPage } =
    await getResources(searchParams);

  const hasFilters = Object.entries(searchParams)
    .filter(([k]) => k !== "page")
    .some(([, v]) => Boolean(v));

  return (
    <>
      <p className="text-xs font-mono text-muted-foreground mb-6">
        // {filteredCount} resource{filteredCount !== 1 ? "s" : ""} found
      </p>

      <section>
        {resources.length === 0 ? (
          <div className="py-16 border border-border">
            <p className="text-center text-muted-foreground font-mono text-sm">
              // no resources matched your query
            </p>
          </div>
        ) : (
          <>
            {!hasFilters && currentPage === 1 && (
              <>
                <SectionHeader label="// featured" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 animate-fade-up">
                  {resources
                    .filter((r) => r.is_featured)
                    .slice(0, 6)
                    .map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                </div>
                <SectionHeader label="// all resources" />
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up">
              {(hasFilters || currentPage > 1
                ? resources
                : resources.filter((r) => !r.is_featured)
              ).map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>

            <div className="mt-8">
              <PaginationBar currentPage={currentPage} totalPages={totalPages} />
            </div>
          </>
        )}
      </section>
    </>
  );
}
