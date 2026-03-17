import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ResourceDetailSkeleton } from "@/components/resource-skeleton";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getResourceBySlug, getRelatedByTags, getRelatedResources } from "@/lib/queries";
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
          <Link href="/" className="font-mono text-sm hover:text-primary transition-colors">
            product_builder_dir
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

  let related = resource.tags.length
    ? await getRelatedByTags(resource.tags, resource.slug)
    : [];
  const relatedLabel =
    related.length > 0
      ? "// related by topic ──────────────────────────"
      : `// more in ${PILLAR_LABELS[resource.pillar] || resource.pillar} ────────────────────`;

  if (!related.length) {
    related = await getRelatedResources(resource.pillar, resource.slug);
  }

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-5 py-8 flex flex-col gap-8">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: resource.name,
            url: resource.url,
            description: resource.description,
            ...(resource.author
              ? { author: { "@type": "Person", name: resource.author } }
              : {}),
            keywords: resource.tags,
            isAccessibleForFree: resource.is_free,
          }).replace(/</g, "\\u003c"),
        }}
      />
      {/* Back link */}
      <Link
        href="/"
        className="text-xs font-mono text-muted-foreground hover:text-foreground"
      >
        ← back to directory
      </Link>

      {/* Resource header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          <span className="text-muted-foreground">
            [{TYPE_LABELS[resource.type] || resource.type} → {PILLAR_LABELS[resource.pillar] || resource.pillar}]
          </span>
          <span className="text-muted-foreground capitalize">[{resource.level}]</span>
          {resource.is_featured && (
            <span className="text-primary">[FEATURED]</span>
          )}
          <span className={resource.is_free ? "text-primary" : "text-muted-foreground"}>
            [{resource.is_free ? "FREE" : "PAID"}]
          </span>
          <span className="text-muted-foreground uppercase">[{resource.language}]</span>
        </div>

        <div className="flex items-center gap-3">
          {resource.logo_url && (
            <Image
              src={resource.logo_url}
              alt=""
              width={36}
              height={36}
              unoptimized
              className="flex-shrink-0 object-contain"
            />
          )}
          <h1 className="text-3xl font-bold tracking-tight">{resource.name}</h1>
        </div>

        {resource.author && (
          <p className="text-xs font-mono text-muted-foreground">// by {resource.author}</p>
        )}
        <p className="text-xs font-mono text-muted-foreground">
          // added {new Date(resource.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
        </p>
      </div>

      {/* Expert Take */}
      {resource.expert_take && (
        <div>
          <p className="text-sm font-mono text-muted-foreground mb-3">
            // expert take ────────────────────────────────
          </p>
          <div className="border-l-4 border-primary pl-4 py-1">
            <p className="text-base leading-relaxed">{resource.expert_take}</p>
          </div>
        </div>
      )}

      {/* Description */}
      {resource.description && (
        <div>
          <p className="text-sm font-mono text-muted-foreground mb-3">
            // description ──────────────────────────────
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {resource.description}
          </p>
        </div>
      )}

      {/* Tags */}
      {resource.tags.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {resource.tags.map((tag: string) => (
            <Link
              key={tag}
              href={`/?search=${encodeURIComponent(tag)}`}
              className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* CTA */}
      <div>
        <a
          href={/^https?:\/\//.test(resource.url) ? resource.url : "#"}
          target="_blank"
          rel="noreferrer"
        >
          <Button size="lg" className="rounded-none font-mono w-full sm:w-auto">
            Visit {resource.name} →
          </Button>
        </a>
      </div>

      {/* Related Resources */}
      {related.length > 0 && (
        <section className="mt-8">
          <p className="text-sm font-mono text-muted-foreground mb-4">
            {relatedLabel}
          </p>
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
