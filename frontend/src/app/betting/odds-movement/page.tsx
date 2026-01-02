import { Metadata } from 'next'
import { AppLayout } from '@/components/layout'
import { OddsMovementDashboard } from '@/components/betting/odds-movement'

export const metadata: Metadata = {
  title: 'Odds Movement | Stat Discute',
  description: 'Analyse des mouvements de cotes NBA - Moneyline, Spreads et Totals',
}

export default function OddsMovementPage() {
  return (
    <AppLayout>
      <div className="max-w-[1800px] mx-auto">
        <OddsMovementDashboard />
      </div>
    </AppLayout>
  )
}
