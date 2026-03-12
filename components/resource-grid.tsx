import { getResources, getResourceCount } from "@/lib/queries";
import { ResourceCard } from "@/components/resource-card";

export async function ResourceGrid({
  searchParams,
}: {
  searchParams: {
    search?: string;
    type?: string;
    pillar?: string;
    level?: string;
    free?: string;
  };
}) {
  const [resources, count] = await Promise.all([
    getResources(searchParams),
    getResourceCount(),
  ]);

  const hasFilters = Object.values(searchParams).some(Boolean);

  return (
    <>
      <p className="text-sm text-muted-foreground">
        {count} resources curated for builders
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
            {!hasFilters && (
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

            {hasFilters && (
              <h2 className="text-xl font-semibold mb-4">
                {resources.length} result{resources.length !== 1 ? "s" : ""}
              </h2>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(hasFilters
                ? resources
                : resources.filter((r) => !r.is_featured)
              ).map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
