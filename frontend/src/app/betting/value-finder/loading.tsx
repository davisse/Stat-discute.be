import { AppLayout } from '@/components/layout'

export default function ValueFinderLoading() {
  return (
    <AppLayout>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px'
      }}>
        {/* Header Skeleton */}
        <div style={{ marginBottom: '40px' }}>
          <div className="h-9 w-72 bg-zinc-800 animate-pulse rounded mb-3" />
          <div className="h-5 w-96 bg-zinc-800 animate-pulse rounded mb-6" />

          {/* Performance Metrics Skeleton */}
          <div className="flex gap-4 flex-wrap">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-4 min-w-[150px]">
                <div className="h-4 w-20 bg-zinc-800 animate-pulse rounded mb-2" />
                <div className="h-8 w-16 bg-zinc-800 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations Grid Skeleton */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
          gap: '24px'
        }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="h-6 w-40 bg-zinc-800 animate-pulse rounded" />
                <div className="h-6 w-24 bg-zinc-800 animate-pulse rounded" />
              </div>

              {/* Content */}
              <div className="space-y-3 mb-4">
                <div className="h-4 w-full bg-zinc-800 animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-zinc-800 animate-pulse rounded" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="bg-white/5 rounded-lg p-3">
                    <div className="h-3 w-16 bg-zinc-800 animate-pulse rounded mb-2" />
                    <div className="h-6 w-12 bg-zinc-800 animate-pulse rounded" />
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="h-5 w-32 bg-zinc-800 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
