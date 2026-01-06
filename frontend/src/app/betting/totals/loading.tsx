import { AppLayout } from '@/components/layout'

export default function TotalsLoading() {
  return (
    <AppLayout>
      <div className="min-h-screen p-6 space-y-8 max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="text-center space-y-2">
          <div className="h-9 w-72 bg-zinc-800 animate-pulse rounded mx-auto" />
          <div className="h-5 w-96 bg-zinc-800 animate-pulse rounded mx-auto" />
        </div>

        {/* Games Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="h-6 w-32 bg-zinc-800 animate-pulse rounded" />
                <div className="h-5 w-20 bg-zinc-800 animate-pulse rounded" />
              </div>

              {/* Teams */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <div className="h-5 w-40 bg-zinc-800 animate-pulse rounded" />
                  <div className="h-5 w-16 bg-zinc-800 animate-pulse rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-5 w-40 bg-zinc-800 animate-pulse rounded" />
                  <div className="h-5 w-16 bg-zinc-800 animate-pulse rounded" />
                </div>
              </div>

              {/* Line Info */}
              <div className="bg-white/5 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-zinc-800 animate-pulse rounded" />
                  <div className="h-6 w-16 bg-zinc-800 animate-pulse rounded" />
                </div>
                <div className="h-3 w-full bg-zinc-800 animate-pulse rounded" />
              </div>

              {/* Verdict */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="h-8 w-32 bg-zinc-800 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
