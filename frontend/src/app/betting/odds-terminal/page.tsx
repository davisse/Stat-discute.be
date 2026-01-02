import { AppLayout } from '@/components/layout/AppLayout'
import { OddsTerminal } from '@/components/betting/odds-terminal'

export const metadata = {
  title: 'Odds Terminal | STAT-DISCUTE',
  description: 'Real-time betting odds movement tracker with ASCII visualization'
}

export default function OddsTerminalPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OddsTerminal />
      </div>
    </AppLayout>
  )
}
