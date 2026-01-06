import { AppLayout } from '@/components/layout'

export default function GameAnalysisLoading() {
  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero Section Skeleton */}
        <div className="relative px-4 sm:px-8 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <div className="h-6 w-32 bg-zinc-800 animate-pulse rounded mb-6" />

            {/* Matchup */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6">
              <div className="text-center">
                <div className="h-16 w-16 bg-zinc-800 animate-pulse rounded-full mx-auto mb-2" />
                <div className="h-8 w-20 bg-zinc-800 animate-pulse rounded mx-auto" />
              </div>
              <div className="h-6 w-8 bg-zinc-800 animate-pulse rounded" />
              <div className="text-center">
                <div className="h-16 w-16 bg-zinc-800 animate-pulse rounded-full mx-auto mb-2" />
                <div className="h-8 w-20 bg-zinc-800 animate-pulse rounded mx-auto" />
              </div>
            </div>

            {/* Game Info */}
            <div className="flex justify-center gap-4">
              <div className="h-5 w-32 bg-zinc-800 animate-pulse rounded" />
              <div className="h-5 w-24 bg-zinc-800 animate-pulse rounded" />
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
          {/* Line Context Section */}
          <section className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="h-7 w-48 bg-zinc-800 animate-pulse rounded mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/5 rounded-lg p-4">
                  <div className="h-4 w-24 bg-zinc-800 animate-pulse rounded mb-2" />
                  <div className="h-8 w-16 bg-zinc-800 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </section>

          {/* Team Performance Section */}
          <section className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="h-7 w-56 bg-zinc-800 animate-pulse rounded mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="h-6 w-32 bg-zinc-800 animate-pulse rounded" />
                  <div className="h-48 w-full bg-zinc-800 animate-pulse rounded" />
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="bg-white/5 rounded-lg p-3">
                        <div className="h-3 w-16 bg-zinc-800 animate-pulse rounded mb-2" />
                        <div className="h-6 w-12 bg-zinc-800 animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Key Factors Section */}
          <section className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="h-7 w-40 bg-zinc-800 animate-pulse rounded mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3 bg-white/5 rounded-lg p-4">
                  <div className="h-8 w-8 bg-zinc-800 animate-pulse rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-zinc-800 animate-pulse rounded mb-2" />
                    <div className="h-3 w-full bg-zinc-800 animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Verdict Section */}
          <section className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-white/10 p-6">
            <div className="h-7 w-32 bg-zinc-800 animate-pulse rounded mb-4" />
            <div className="flex items-center gap-4">
              <div className="h-12 w-32 bg-zinc-800 animate-pulse rounded" />
              <div className="flex-1">
                <div className="h-4 w-full bg-zinc-800 animate-pulse rounded mb-2" />
                <div className="h-4 w-3/4 bg-zinc-800 animate-pulse rounded" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  )
}
