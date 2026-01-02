import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({ title, value, subtitle, icon: Icon, trend }: StatCardProps) {
  const trendColor = {
    up: 'text-emerald-500',
    down: 'text-red-500',
    neutral: 'text-zinc-500',
  }[trend || 'neutral']

  return (
    <div
      className="border border-zinc-800 rounded-lg p-6"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          {title}
        </span>
        {Icon && <Icon className="h-5 w-5 text-zinc-500" />}
      </div>
      <div className="text-4xl font-black text-white font-mono tracking-tight">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {subtitle && (
        <p className={`text-sm ${trendColor} mt-2`}>{subtitle}</p>
      )}
    </div>
  )
}
