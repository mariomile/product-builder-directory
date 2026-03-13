import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ResourceDetailSkeleton } from "@/components/resource-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getResourceBySlug, getRelatedResources } from "@/lib/queries";
import { ResourceCard } from "@/components/resource-card";
import { TYPE_LABELS, PILLAR_LABELS } from "@/lib/constants";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const resource = await getResourceBySlug(slug);
    return {
      title: `${resource.name} — Product Builder Directory`,
      description: resource.expert_take || resource.description,
    };
  } catch {
    return { title: "Resource Not Found" };
  }
}

export default function ResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="w-full flex justify-center border-b border-border/50 h-14">
        <div className="w-full max-w-6xl flex justify-between items-center px-5">
          <Link href="/" className="font-semibold text-sm hover:underline">
            Product Builder Directory
          </Link>
        </div>
      </nav>

      <Suspense fallback={<ResourceDetailSkeleton />}>
        <ResourceDetail paramsPromise={params} />
      </Suspense>
    </main>
  );
}

async function ResourceDetail({
  paramsPromise,
}: {
  paramsPromise: Promise<{ slug: string }>;
}) {
  const { slug } = await paramsPromise;

  let resource;
  try {
    resource = await getResourceBySlug(slug);
  } catch {
    notFound();
  }

  const related = await getRelatedResources(resource.pillar, resource.slug);

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-5 py-8 flex flex-col gap-8">
      {/* Back link */}
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to directory
      </Link>

      {/* Resource header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge>{TYPE_LABELS[resource.type] || resource.type}</Badge>
          <Badge variant="outline">
            {PILLAR_LABELS[resource.pillar] || resource.pillar}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {resource.level}
          </Badge>
          {resource.is_featured && (
            <Badge variant="outline" className="border-primary text-primary">
              Featured
            </Badge>
          )}
          {resource.is_free ? (
            <Badge
              variant="outline"
              className="text-primary border-primary"
            >
              Free
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-muted-foreground border-border"
            >
              Paid
            </Badge>
          )}
          <Badge variant="outline" className="uppercase text-xs">
            {resource.language}
          </Badge>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">{resource.name}</h1>

        {resource.author && (
          <p className="text-muted-foreground">by {resource.author}</p>
        )}
      </div>

      {/* Expert Take */}
      {resource.expert_take && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Expert Take</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed">{resource.expert_take}</p>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {resource.description && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-muted-foreground leading-relaxed">
            {resource.description}
          </p>
        </div>
      )}

      {/* Tags */}
      <div className="flex gap-2 flex-wrap">
        {resource.tags.map((tag: string) => (
          <Link key={tag} href={`/?search=${encodeURIComponent(tag)}`}>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-accent"
            >
              {tag}
            </Badge>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div>
        <a href={resource.url} target="_blank" rel="noreferrer">
          <Button size="lg" className="w-full sm:w-auto">
            Visit {resource.name} &rarr;
          </Button>
        </a>
      </div>

      {/* Related Resources */}
      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            More in {PILLAR_LABELS[resource.pillar] || resource.pillar}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {related.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
