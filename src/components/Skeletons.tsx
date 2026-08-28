export function CatalogCardSkeleton() {
  return (
    <div className="surface-card overflow-hidden">
      <div className="h-[320px] animate-pulse bg-white/5" />
      <div className="space-y-4 p-5">
        <div className="h-3 w-32 animate-pulse rounded-full bg-white/5" />
        <div className="h-7 w-4/5 animate-pulse rounded-full bg-white/5" />
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/5" />
        <div className="h-12 animate-pulse rounded-full bg-white/5" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="page-shell py-16">
      <div className="h-5 w-36 animate-pulse rounded-full bg-white/5" />
      <div className="mt-4 h-14 max-w-xl animate-pulse rounded-2xl bg-white/5" />
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map(
          (_, index) => (
            <CatalogCardSkeleton key={index} />
          )
        )}
      </div>
    </div>
  );
}
