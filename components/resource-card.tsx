import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Resource } from "@/lib/queries";
import { TYPE_LABELS, PILLAR_LABELS } from "@/lib/constants";
import { ArrowUpRight } from "lucide-react";
import { FilterLink } from "@/components/filter-link";
import { CopyLinkButton } from "@/components/copy-link-button";
import Image from "next/image";

function isNewThisWeek(createdAt: string): boolean {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  return diffMs >= 0 && diffMs < 7 * 24 * 60 * 60 * 1000;
}

export function ResourceCard({
  resource,
  index = 0,
}: {
  resource: Resource;
  index?: number;
}) {
  const isNew = isNewThisWeek(resource.created_at);

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noreferrer"
      data-card-index={index}
      className="h-full block group animate-stagger"
      style={{ "--i": index } as React.CSSProperties}
    >
      <Card className="h-full cursor-pointer border-border hover:border-primary flex flex-col transition-[border-color,transform] duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0">
        <CardHeader className="pb-3 flex-1">
          {/* Meta row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-0.5">
              [<FilterLink paramKey="type" value={resource.type}>
                {TYPE_LABELS[resource.type] || resource.type}
              </FilterLink>
              {" → "}
              <FilterLink paramKey="pillar" value={resource.pillar}>
                {PILLAR_LABELS[resource.pillar] || resource.pillar}
              </FilterLink>]
            </span>
            <span
              className={`text-xs font-mono flex-shrink-0 ${
                resource.is_free ? "text-primary" : "text-muted-foreground"
              }`}
            >
              [{resource.is_free ? "FREE" : "PAID"}]
            </span>
          </div>

          {/* Name + logo + external arrow */}
          <div className="flex items-start gap-2">
            {resource.logo_url && (
              <Image
                src={resource.logo_url}
                alt=""
                width={20}
                height={20}
                unoptimized
                className="flex-shrink-0 mt-0.5 object-contain"
              />
            )}
            <CardTitle className="leading-tight flex-1 text-xl">
              {resource.name}
              {isNew && (
                <span className="ml-2 text-xs text-primary font-mono align-middle">
                  NEW
                </span>
              )}
            </CardTitle>
            <ArrowUpRight className="h-3.5 w-3.5 flex-shrink-0 mt-1 text-muted-foreground opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary" />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Expert take */}
          {resource.expert_take && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {resource.expert_take}
            </p>
          )}

          {/* Tags + copy link */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground font-mono">
              {resource.tags.slice(0, 4).map((t) => `#${t}`).join("  ")}
            </p>
            <CopyLinkButton url={resource.url} />
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
