import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Resource } from "@/lib/queries";

const typeColors: Record<string, string> = {
  tool: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  course: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  article: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  newsletter: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  book: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  podcast: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  video: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  community: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  x_post: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  framework: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
};

const typeLabels: Record<string, string> = {
  tool: "Tool",
  course: "Course",
  article: "Article",
  newsletter: "Newsletter",
  book: "Book",
  podcast: "Podcast",
  video: "Video",
  community: "Community",
  x_post: "X Post",
  framework: "Framework",
};

const pillarLabels: Record<string, string> = {
  discovery: "Discovery",
  design: "Design",
  delivery: "Delivery",
  strategy: "Strategy",
  stack: "Stack & Tools",
  meta_skill: "Meta-skill",
};

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Link href={`/resources/${resource.slug}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge
              className={
                typeColors[resource.type] || "bg-gray-100 text-gray-800"
              }
            >
              {typeLabels[resource.type] || resource.type}
            </Badge>
            <Badge variant="outline">
              {pillarLabels[resource.pillar] || resource.pillar}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {resource.level}
            </Badge>
            {resource.is_featured && (
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
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
                className="text-xs bg-muted px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            {resource.is_free ? (
              <span className="text-xs text-green-600 font-medium">Free</span>
            ) : (
              <span className="text-xs text-orange-600 font-medium">Paid</span>
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
