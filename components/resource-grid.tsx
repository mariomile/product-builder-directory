import { getResources } from "@/lib/queries";
import { ResourceCard } from "@/components/resource-card";
import { PaginationBar } from "@/components/pagination-bar";

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
      <p className="text-sm text-muted-foreground">
        {filteredCount} result{filteredCount !== 1 ? "s" : ""}
      </p>

      <section>
        {resources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No resources found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <>
            {!hasFilters && currentPage === 1 && (
              <>
                <h2 className="text-xl font-semibold mb-4">Featured</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {resources
                    .filter((r) => r.is_featured)
                    .slice(0, 6)
                    .map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                </div>
                <h2 className="text-xl font-semibold mb-4">All Resources</h2>
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(hasFilters || currentPage > 1
                ? resources
                : resources.filter((r) => !r.is_featured)
              ).map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>

            <div className="mt-6">
              <PaginationBar currentPage={currentPage} totalPages={totalPages} />
            </div>
          </>
        )}
      </section>
    </>
  );
}
