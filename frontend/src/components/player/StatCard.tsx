'use client'

interface StatCardProps {
  label: string           // "Points Per Game"
  shortLabel: string      // "PPG"
  value: number | null    // 20.4
  rank: number | null     // 8
  totalPlayers?: number   // 450
  size: 'hero' | 'large' | 'medium' | 'small'
  suffix?: string         // "%" for percentages
  lowerIsBetter?: boolean // true for TOV
  className?: string      // Additional tailwind classes
}

export default function StatCard({
  label,
  shortLabel,
  value,
  rank,
  totalPlayers,
  size,
  suffix = '',
  lowerIsBetter = false,
  className = ''
}: StatCardProps) {
  const isTopTen = rank !== null && rank <= 10
  const displayValue = value !== null ? `${value}${suffix}` : '-'

  // Size-specific styles
  const sizeConfig = {
    hero: {
      container: 'bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-700 p-6 lg:p-8 rounded-2xl',
      value: 'text-5xl lg:text-7xl font-bold text-white',
      label: 'text-xs uppercase tracking-wider text-zinc-400 mb-2',
      rank: isTopTen
        ? 'text-emerald-400 font-medium text-sm mt-2'
        : 'text-zinc-500 text-sm mt-2'
    },
    large: {
      container: 'bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl',
      value: 'text-4xl lg:text-5xl font-bold text-white',
      label: 'text-xs uppercase tracking-wider text-zinc-400 mb-1',
      rank: isTopTen
        ? 'text-emerald-400 font-medium text-xs mt-1'
        : 'text-zinc-500 text-xs mt-1'
    },
    medium: {
      container: 'bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl',
      value: 'text-3xl font-bold text-white',
      label: 'text-[10px] uppercase tracking-wider text-zinc-400 mb-1',
      rank: isTopTen
        ? 'text-emerald-400 font-medium text-[10px] mt-1'
        : 'text-zinc-500 text-[10px] mt-1'
    },
    small: {
      container: 'bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl',
      value: 'text-2xl font-mono font-bold text-white',
      label: 'text-[10px] uppercase tracking-wider text-zinc-400 mb-0.5',
      rank: isTopTen
        ? 'text-emerald-400 font-medium text-[10px]'
        : 'text-zinc-500 text-[10px]'
    }
  }

  const config = sizeConfig[size]

  const formatRank = () => {
    if (rank === null) return null

    if (lowerIsBetter) {
      return (
        <span className={config.rank}>
          #{rank} {isTopTen && <span className="opacity-70">(best)</span>}
        </span>
      )
    }

    if (size === 'hero' || size === 'large') {
      return (
        <span className={config.rank}>
          #{rank} in NBA
        </span>
      )
    }

    return (
      <span className={config.rank}>
        #{rank}
      </span>
    )
  }

  return (
    <div className={`${config.container} ${className}`}>
      <div className={config.label}>
        {size === 'hero' ? label : shortLabel}
      </div>
      <div className={config.value}>
        {displayValue}
      </div>
      {formatRank()}
    </div>
  )
}
