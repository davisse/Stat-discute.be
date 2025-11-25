import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

export function StatsCard({ title, value, subtitle, icon, trend }: StatsCardProps) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      border: '1px solid #E5E7EB'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>
            {title}
          </p>
          <p style={{ color: '#111827', fontSize: '32px', fontWeight: '700', lineHeight: '1.2' }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '4px' }}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div style={{ color: '#6B7280', opacity: 0.6 }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
