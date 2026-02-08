import { Skeleton } from "@/components/ui/skeleton";

export function ClubDetailSkeleton() {
  return (
    <div className="flex flex-col items-center max-w-[640px] mx-auto px-4 lg:px-12 py-8">
      {/* Crest placeholder */}
      <Skeleton className="w-[120px] h-[120px] rounded-full bg-surface mb-6" />

      {/* Name + ticker */}
      <Skeleton className="h-7 w-48 bg-surface mb-2" />
      <Skeleton className="h-4 w-32 bg-surface mb-8" />

      {/* Price */}
      <Skeleton className="h-9 w-28 bg-surface mb-2" />
      <Skeleton className="h-4 w-16 bg-surface mb-8" />

      {/* About section */}
      <div className="w-full mb-8">
        <Skeleton className="h-5 w-40 bg-surface mb-3" />
        <div className="flex gap-2 mb-3">
          <Skeleton className="h-7 w-16 rounded-full bg-surface" />
          <Skeleton className="h-7 w-20 rounded-full bg-surface" />
        </div>
        <Skeleton className="h-4 w-full bg-surface mb-2" />
        <Skeleton className="h-4 w-full bg-surface mb-2" />
        <Skeleton className="h-4 w-3/4 bg-surface" />
      </div>

      {/* CTA placeholder */}
      <Skeleton className="h-12 w-full max-w-[320px] rounded-xl bg-surface" />
    </div>
  );
}
