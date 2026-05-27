export function EntryCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-3 w-32 bg-border rounded"></div>
        <div className="h-2.5 w-2.5 bg-border rounded-full"></div>
      </div>
      <div className="h-6 w-3/4 bg-border rounded mb-4"></div>
      <div className="space-y-2 mb-6">
        <div className="h-4 w-full bg-border/60 rounded"></div>
        <div className="h-4 w-5/6 bg-border/60 rounded"></div>
      </div>
      <div className="flex gap-2 pt-4 border-t border-border">
        <div className="h-5 w-16 bg-border/60 rounded"></div>
        <div className="h-5 w-12 bg-border/60 rounded"></div>
      </div>
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-6 w-24 bg-border rounded"></div>
      <div className="space-y-4">
        <EntryCardSkeleton />
        <EntryCardSkeleton />
        <EntryCardSkeleton />
      </div>
    </div>
  );
}
