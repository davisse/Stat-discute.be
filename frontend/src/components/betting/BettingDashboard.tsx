'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import MoneyLinesCard from './MoneyLinesCard'
import TotalsCard from './TotalsCard'
import PlayerPropsAnalysis from './PlayerPropsAnalysis'
import type { GameOdds } from '@/types/betting'

interface BettingDashboardProps {
  game: GameOdds | null
}

type TabType = 'moneylines' | 'totals' | 'playerprops'

const tabs = [
  {
    id: 'moneylines' as TabType,
    label: 'MoneyLines',
    icon: DollarSign,
    color: 'green',
    bgGradient: 'from-green-50 to-transparent dark:from-green-950/20',
    iconColor: 'text-green-600',
    activeColor: 'bg-green-600 text-white',
    borderColor: 'border-green-600',
  },
  {
    id: 'totals' as TabType,
    label: 'Totals',
    icon: TrendingUp,
    color: 'blue',
    bgGradient: 'from-blue-50 to-transparent dark:from-blue-950/20',
    iconColor: 'text-blue-600',
    activeColor: 'bg-blue-600 text-white',
    borderColor: 'border-blue-600',
  },
  {
    id: 'playerprops' as TabType,
    label: 'Player Props',
    icon: Trophy,
    color: 'purple',
    bgGradient: 'from-purple-50 to-transparent dark:from-purple-950/20',
    iconColor: 'text-purple-600',
    activeColor: 'bg-purple-600 text-white',
    borderColor: 'border-purple-600',
  },
]

export default function BettingDashboard({ game }: BettingDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('moneylines')
  const activeTabConfig = tabs.find(tab => tab.id === activeTab)!

  return (
    <div className="w-full space-y-4">
      {/* Mobile: Segmented Control */}
      <div className="md:hidden">
        <div className="flex bg-muted/50 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-md transition-all duration-200 font-medium text-sm",
                  isActive
                    ? tab.activeColor
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                )}
                aria-label={`View ${tab.label}`}
                aria-current={isActive ? 'true' : 'false'}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden xs:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Desktop: Traditional Tabs */}
      <div className="hidden md:block border-b">
        <div className="flex gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 pb-3 px-1 border-b-2 transition-all duration-200 font-medium",
                  isActive
                    ? cn(tab.borderColor, tab.iconColor, 'border-opacity-100')
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                )}
                aria-label={`View ${tab.label}`}
                aria-current={isActive ? 'true' : 'false'}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content Area with Smooth Transitions */}
      <div className="relative min-h-[400px]">
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            activeTab === 'moneylines' ? 'opacity-100 translate-x-0' : 'opacity-0 absolute inset-0 pointer-events-none -translate-x-4'
          )}
        >
          {activeTab === 'moneylines' && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
              <MoneyLinesCard game={game} />
            </div>
          )}
        </div>

        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            activeTab === 'totals' ? 'opacity-100 translate-x-0' : 'opacity-0 absolute inset-0 pointer-events-none -translate-x-4'
          )}
        >
          {activeTab === 'totals' && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
              <TotalsCard game={game} />
            </div>
          )}
        </div>

        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            activeTab === 'playerprops' ? 'opacity-100 translate-x-0' : 'opacity-0 absolute inset-0 pointer-events-none -translate-x-4'
          )}
        >
          {activeTab === 'playerprops' && game && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
              <PlayerPropsAnalysis game={game} />
            </div>
          )}
        </div>
      </div>

      {/* Optional: Tab indicator for current selection (mobile) */}
      <div className="md:hidden flex justify-center gap-1.5 mt-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "h-1.5 rounded-full transition-all duration-200",
              activeTab === tab.id ? cn("w-8", tab.activeColor.split(' ')[0]) : "w-1.5 bg-muted-foreground/30"
            )}
          />
        ))}
      </div>
    </div>
  )
}