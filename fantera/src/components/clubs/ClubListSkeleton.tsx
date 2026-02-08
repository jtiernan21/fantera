import { Skeleton } from "@/components/ui/skeleton";

export function ClubListSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3 border-b border-glass-border"
        >
          <Skeleton className="w-10 h-10 rounded-full bg-surface" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32 bg-surface" />
            <Skeleton className="h-3 w-20 bg-surface" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-4 w-16 bg-surface ml-auto" />
            <Skeleton className="h-3 w-12 bg-surface ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}
