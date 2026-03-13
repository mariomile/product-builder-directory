import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Resource } from "@/lib/queries";
import { TYPE_LABELS, PILLAR_LABELS, TYPE_BADGE_CLASSES } from "@/lib/constants";

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Link href={`/resources/${resource.slug}`}>
      <Card className="h-full hover:border-primary transition-colors cursor-pointer border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant="outline" className={`text-xs font-mono ${TYPE_BADGE_CLASSES[resource.type] || "border-border text-foreground"}`}>
              {TYPE_LABELS[resource.type] || resource.type}
            </Badge>
            <Badge variant="outline">
              {PILLAR_LABELS[resource.pillar] || resource.pillar}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {resource.level}
            </Badge>
            {resource.is_featured && (
              <Badge variant="outline" className="border-primary text-primary text-xs">
                Featured
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg leading-tight">
            {resource.name}
          </CardTitle>
          {resource.author && (
            <p className="text-sm text-muted-foreground">
              by {resource.author}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {resource.expert_take && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {resource.expert_take}
            </p>
          )}
          <div className="flex gap-1 flex-wrap mt-3">
            {resource.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-muted px-2 py-0.5 rounded-none"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            {resource.is_free ? (
              <span className="text-xs text-primary font-medium">Free</span>
            ) : (
              <span className="text-xs text-muted-foreground font-medium">Paid</span>
            )}
            <span className="text-xs text-muted-foreground uppercase">
              {resource.language}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
