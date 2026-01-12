import { AppLayout } from '@/components/layout'
import { getAllTeams } from '@/lib/queries'
import { PropsLabContent } from './PropsLabContent'

// Disable static prerendering - requires database connection
export const dynamic = 'force-dynamic'

export default async function PropsLabPage() {
  // Fetch teams server-side
  const teams = await getAllTeams()

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
            Props Lab
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Analyse avancée des player props
          </p>
        </div>

        {/* Main Content */}
        <PropsLabContent teams={teams} />

      </div>
    </AppLayout>
  )
}
