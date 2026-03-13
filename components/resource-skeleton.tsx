export function ResourceCardSkeleton() {
  return (
    <div className="border border-border p-4 font-mono">
      <div className="h-3 w-16 bg-muted animate-pulse mb-3" />
      <div className="h-4 w-3/4 bg-muted animate-pulse mb-2" />
      <div className="h-3 w-full bg-muted animate-pulse mb-1" />
      <div className="h-3 w-5/6 bg-muted animate-pulse mb-4" />
      <div className="flex gap-1">
        <div className="h-3 w-12 bg-muted animate-pulse" />
        <div className="h-3 w-12 bg-muted animate-pulse" />
      </div>
    </div>
  );
}

export function ResourceGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <ResourceCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ResourceDetailSkeleton() {
  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-5 py-8 flex flex-col gap-6 font-mono">
      <div className="h-3 w-24 bg-muted animate-pulse" />
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-muted animate-pulse" />
        <div className="h-5 w-20 bg-muted animate-pulse" />
      </div>
      <div className="h-8 w-2/3 bg-muted animate-pulse" />
      <div className="border border-border p-4">
        <div className="h-3 w-full bg-muted animate-pulse mb-2" />
        <div className="h-3 w-5/6 bg-muted animate-pulse mb-2" />
        <div className="h-3 w-4/6 bg-muted animate-pulse" />
      </div>
    </div>
  );
}
