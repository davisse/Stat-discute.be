import { AppLayout } from '@/components/layout'

export default function Q1ValueLoading() {
  return (
    <AppLayout>
      <div className="min-h-screen p-6 space-y-8">
        {/* Header Skeleton */}
        <div className="text-center space-y-2">
          <div className="h-9 w-80 bg-zinc-800 animate-pulse rounded mx-auto" />
          <div className="h-5 w-96 bg-zinc-800 animate-pulse rounded mx-auto" />
        </div>

        {/* Info Box Skeleton */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-white/10 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-zinc-800 animate-pulse rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-zinc-800 animate-pulse rounded" />
              <div className="h-4 w-full bg-zinc-800 animate-pulse rounded" />
              <div className="h-3 w-3/4 bg-zinc-800 animate-pulse rounded" />
            </div>
          </div>
        </div>

        {/* Today's Games Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-7 w-40 bg-zinc-800 animate-pulse rounded" />
            <div className="h-5 w-20 bg-zinc-800 animate-pulse rounded" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-4">
                {/* Header */}
                <div className="flex justify-between">
                  <div className="h-6 w-32 bg-zinc-800 animate-pulse rounded" />
                  <div className="h-4 w-24 bg-zinc-800 animate-pulse rounded" />
                </div>

                {/* Team Stats */}
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2].map((j) => (
                    <div key={j} className="bg-blue-500/10 rounded-lg p-3">
                      <div className="h-5 w-16 bg-zinc-800 animate-pulse rounded mb-2" />
                      <div className="grid grid-cols-2 gap-2">
                        {[1, 2, 3, 4].map((k) => (
                          <div key={k}>
                            <div className="h-3 w-12 bg-zinc-800 animate-pulse rounded mb-1" />
                            <div className="h-4 w-8 bg-zinc-800 animate-pulse rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Projections */}
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {[1, 2, 3].map((j) => (
                      <div key={j}>
                        <div className="h-8 w-12 bg-zinc-800 animate-pulse rounded mx-auto mb-1" />
                        <div className="h-3 w-16 bg-zinc-800 animate-pulse rounded mx-auto" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Probability Bar */}
                <div className="h-2 w-full bg-zinc-800 animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        </section>

        {/* Leaderboards Section */}
        <section className="space-y-4">
          <div className="h-7 w-40 bg-zinc-800 animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-4">
                <div className="h-4 w-28 bg-zinc-800 animate-pulse rounded mb-3" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="flex justify-between">
                      <div className="h-4 w-16 bg-zinc-800 animate-pulse rounded" />
                      <div className="h-4 w-10 bg-zinc-800 animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
