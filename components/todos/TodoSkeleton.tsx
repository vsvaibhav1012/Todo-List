export function TodoSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading todos">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-lg border bg-card animate-pulse">
          <div className="h-5 w-5 rounded bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/3" />
          </div>
          <div className="h-5 w-16 bg-muted rounded-full" />
        </div>
      ))}
    </div>
  );
}
