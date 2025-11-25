import { AppLayout } from '@/components/layout'
import { CourtZoneDefense } from '@/components/defense'

export default function CourtDefenseTestPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Court Zone Defense Component
          </h1>
          <p className="text-gray-400">
            Interactive visualization of opponent shooting performance by court zone
          </p>
        </div>

        <CourtZoneDefense />
      </div>
    </AppLayout>
  )
}
