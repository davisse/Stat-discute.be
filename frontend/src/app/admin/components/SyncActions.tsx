'use client'

import { SyncButton } from './SyncButton'

export function SyncActions() {
  const handleSuccess = () => {
    window.location.reload()
  }

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      padding: '24px'
    }}>
      <h2 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#111827',
        margin: '0 0 16px 0'
      }}>
        Sync Actions
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <SyncButton
          label="Sync Games"
          endpoint="/api/admin/sync-games"
          onSuccess={handleSuccess}
        />
        <SyncButton
          label="Fetch Player Stats"
          endpoint="/api/admin/fetch-player-stats"
          onSuccess={handleSuccess}
        />
        <SyncButton
          label="Calculate Analytics"
          endpoint="/api/admin/calculate-analytics"
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  )
}
