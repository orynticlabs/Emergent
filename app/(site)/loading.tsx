// Next.js's route-segment loading UI - automatically shown while any page
// inside the (site) route group is loading. Scoped to the marketing site
// only: this file lives in app/(site)/, not app/admin/, so OryCMS never
// renders it.
import { Skeleton } from "./_shared/components/ui/skeleton";

export default function SiteLoading() {
  return (
    <div className="min-h-screen bg-brand-ink px-6 pt-40 pb-24 md:px-10 md:pt-52">
      <div className="mx-auto max-w-7xl">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-6 h-12 w-2/3 max-w-2xl" />
        <Skeleton className="mt-4 h-12 w-1/2 max-w-xl" />
        <Skeleton className="mt-8 h-4 w-full max-w-lg" />
        <Skeleton className="mt-2 h-4 w-4/5 max-w-md" />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
