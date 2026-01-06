export const dynamic = 'force-dynamic'

import { AppLayout } from '@/components/layout'
import { PlayerSearch } from '@/components/player-search'

export default async function PlayersPage() {
  return (
    <AppLayout>
      {/* Search Section - Positioned right below header */}
      <section className="px-4 sm:px-6 md:px-8 pt-4 sm:pt-8 pb-12">
        <div className="max-w-4xl mx-auto w-full">
          {/* Section identifier */}
          <div className="mb-6 flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-500 tracking-widest font-mono">01</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          {/* Hero Typography */}
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500 mb-3">
              Player Statistics
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white leading-[0.85]">
              Find Your
              <br />
              <span className="text-zinc-600">Player</span>
            </h1>
          </div>

          {/* Search Component */}
          <PlayerSearch />

          {/* Hint Text */}
          <p className="mt-6 text-sm text-zinc-600 max-w-md">
            Search by name to explore detailed statistics, game logs, and performance trends.
          </p>
        </div>
      </section>
    </AppLayout>
  )
}
