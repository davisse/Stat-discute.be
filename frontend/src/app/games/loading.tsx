import { AppLayout } from '@/components/layout'

export default function GamesLoading() {
  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-11rem)] px-4 md:px-8 py-8 max-w-7xl mx-auto">
        {/* Page Header Skeleton */}
        <div className="mb-8">
          <div className="h-9 w-64 bg-zinc-800 animate-pulse rounded mb-2" />
          <div className="h-5 w-96 bg-zinc-800 animate-pulse rounded" />
        </div>

        {/* Today's Games Section */}
        <section className="mb-12">
          <div className="h-7 w-48 bg-zinc-800 animate-pulse rounded mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="h-5 w-32 bg-zinc-800 animate-pulse rounded" />
                    <div className="h-5 w-12 bg-zinc-800 animate-pulse rounded" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-5 w-32 bg-zinc-800 animate-pulse rounded" />
                    <div className="h-5 w-12 bg-zinc-800 animate-pulse rounded" />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <div className="h-5 w-16 bg-zinc-800 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Games Section */}
        <section className="mb-12">
          <div className="h-7 w-48 bg-zinc-800 animate-pulse rounded mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                <div className="h-4 w-24 bg-zinc-800 animate-pulse rounded mb-3" />
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="h-5 w-32 bg-zinc-800 animate-pulse rounded" />
                    <div className="h-5 w-8 bg-zinc-800 animate-pulse rounded" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-5 w-32 bg-zinc-800 animate-pulse rounded" />
                    <div className="h-5 w-8 bg-zinc-800 animate-pulse rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
