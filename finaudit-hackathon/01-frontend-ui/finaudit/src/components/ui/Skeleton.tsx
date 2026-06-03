type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`shimmer ${className}`} aria-hidden />;
}

/** Three-line shimmer block used inside the AI explanation panel. */
export function SkeletonLines() {
  return (
    <div className="space-y-2" role="status" aria-live="polite">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-[92%]" />
      <Skeleton className="h-3 w-[70%]" />
    </div>
  );
}
