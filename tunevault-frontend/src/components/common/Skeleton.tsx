export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-[#282828] rounded animate-pulse ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-[#181818] rounded-lg p-4">
      <Skeleton className="aspect-square rounded-md mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
