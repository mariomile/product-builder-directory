import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Resource } from "@/lib/queries";
import { TYPE_LABELS, PILLAR_LABELS } from "@/lib/constants";

export function ResourceCard({ resource }: { resource: Resource }) {
  const isFeatured = resource.is_featured;

  return (
    <a href={resource.url} target="_blank" rel="noreferrer" className="h-full block">
      <Card
        className={`h-full cursor-pointer transition-colors border-border hover:border-primary flex flex-col ${
          isFeatured ? "border-t-2 border-t-primary" : ""
        }`}
      >
        <CardHeader className="pb-3 flex-1">
          {/* Meta row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-mono text-muted-foreground">
              [{TYPE_LABELS[resource.type] || resource.type} → {PILLAR_LABELS[resource.pillar] || resource.pillar}]
            </span>
            <span
              className={`text-xs font-mono flex-shrink-0 ${
                resource.is_free ? "text-primary" : "text-muted-foreground"
              }`}
            >
              [{resource.is_free ? "FREE" : "PAID"}]
            </span>
          </div>

          {/* Name */}
          <CardTitle
            className={`leading-tight ${
              isFeatured ? "text-2xl" : "text-xl"
            }`}
          >
            {resource.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Expert take */}
          {resource.expert_take && (
            <p
              className={`text-sm text-muted-foreground mb-3 ${
                isFeatured ? "" : "line-clamp-2"
              }`}
            >
              {resource.expert_take}
            </p>
          )}

          {/* Tags */}
          <p className="text-xs text-muted-foreground font-mono">
            {resource.tags.slice(0, 4).map((t) => `#${t}`).join("  ")}
          </p>
        </CardContent>
      </Card>
    </a>
  );
}
