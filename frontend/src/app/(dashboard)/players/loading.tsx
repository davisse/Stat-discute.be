import { AppLayout } from '@/components/layout'

export default function PlayersLoading() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-8 py-12 space-y-20">

        {/* Section 01: Overview Skeleton */}
        <section>
          <div className="mb-8">
            <div className="h-4 w-6 bg-zinc-800 animate-pulse rounded" />
            <div className="h-0.5 w-8 bg-zinc-700 mt-2" />
          </div>
          <div className="h-12 w-48 bg-zinc-800 animate-pulse rounded mb-4" />
          <div className="h-6 w-96 bg-zinc-800 animate-pulse rounded mb-8" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-zinc-800 rounded-lg p-6"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 w-24 bg-zinc-800 animate-pulse rounded" />
                  <div className="h-5 w-5 bg-zinc-800 animate-pulse rounded" />
                </div>
                <div className="h-10 w-20 bg-zinc-800 animate-pulse rounded mb-2" />
                <div className="h-4 w-32 bg-zinc-800 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </section>

        {/* Section 02: Top Performers Skeleton */}
        <section>
          <div className="mb-8">
            <div className="h-4 w-6 bg-zinc-800 animate-pulse rounded" />
            <div className="h-0.5 w-8 bg-zinc-700 mt-2" />
          </div>
          <div className="h-10 w-64 bg-zinc-800 animate-pulse rounded mb-4" />
          <div className="h-6 w-80 bg-zinc-800 animate-pulse rounded mb-8" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-zinc-800 rounded-lg p-6"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-4 w-4 bg-zinc-800 animate-pulse rounded" />
                  <div className="h-4 w-32 bg-zinc-800 animate-pulse rounded" />
                </div>
                <div className="h-7 w-48 bg-zinc-800 animate-pulse rounded mb-3" />
                <div className="flex items-baseline justify-between mb-2">
                  <div className="h-4 w-10 bg-zinc-800 animate-pulse rounded" />
                  <div className="h-8 w-16 bg-zinc-800 animate-pulse rounded" />
                </div>
                <div className="h-3 w-24 bg-zinc-800 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </section>

        {/* Section 03: Table Skeleton */}
        <section>
          <div className="mb-8">
            <div className="h-4 w-6 bg-zinc-800 animate-pulse rounded" />
            <div className="h-0.5 w-8 bg-zinc-700 mt-2" />
          </div>
          <div className="h-10 w-72 bg-zinc-800 animate-pulse rounded mb-4" />
          <div className="h-6 w-96 bg-zinc-800 animate-pulse rounded mb-8" />

          <div
            className="border border-zinc-800 rounded-lg overflow-hidden"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
          >
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {/* Table Header */}
                <div className="flex gap-4 p-4 border-b border-zinc-800">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
                    <div key={i} className="h-4 w-12 bg-zinc-800 animate-pulse rounded" />
                  ))}
                </div>
                {/* Table Rows */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="flex gap-4 p-4 border-b border-zinc-800 last:border-0">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((j) => (
                      <div key={j} className="h-4 w-12 bg-zinc-800 animate-pulse rounded" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
